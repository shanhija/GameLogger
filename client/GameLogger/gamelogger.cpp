#include "gamelogger.h"
#include "common.h"

GameLogger::GameLogger(QString serverUrl, QString player)
{
    settings = new Settings(serverUrl, player);

    networkHandler = new NetworkHandler(settings);
    connect(networkHandler, SIGNAL(error(QString)), this, SLOT(networkError(QString)));

    // Transfer handling to timer thread
    timer = new QTimer(this);
    timer->setSingleShot(false);
    timer->setInterval(0);
    connect(timer, SIGNAL(timeout()), this, SLOT(querySettings()));
    timer->start();

    updates = 0;
}

GameLogger::~GameLogger() {
    timer->stop();
    delete timer;
    delete networkHandler;
    delete apmLog;
    delete gameLog;
    delete settings;
}

void GameLogger::notifyClose()
{
    timer->stop();
    networkHandler->reportNoSession(0);
}


void GameLogger::querySettings() {
    QDEBUG("[GameLogger::querySettings()] called");
    networkHandler->querySettings();
    waitedForSettings = 0;

    // The first timeout in timer was to get the settings
    disconnect(timer, SIGNAL(timeout()), this, SLOT(querySettings()));
    timer->setInterval(1000-QTime::currentTime().msec()); // Baseline 1 second interval/resolution
    metronome.start();
    connect(timer, SIGNAL(timeout()), this, SLOT(update()));
}

void GameLogger::update() {
    QDEBUG("[GameLogger::update()] called at %d", QTime::currentTime().msec());

    if (!settings->ready) {
        // Settings not ready wait for them
        ++waitedForSettings;
        if (waitedForSettings > 30) {
            emit error("Couldn't get settings within 30 sec.");
        }
        return;
    } else {
        if (waitedForSettings >= 0) {
            // This is the first time the settings are ready
            gameLog = new GameLog(settings);
            apmLog = new APMLog(settings->apmBufferSize, settings->serverTime);

            // When program is fired up, stop any previous sessions.
            networkHandler->reportNoSession(apmLog->current);

            // Notify settings changed
            emit settingsReady(settings);

            waitedForSettings = -1;
        }
    }


    // Settings are ready at this stage

    // Update APM
    if (apmLog->update()) {
        // APM buffer is filled. Send it to server
        networkHandler->sendAPM(apmLog->buffer, apmLog->bufferSize);
    }

    if ((++updates) % 60 == 1) {
        // Updage game session with current APM every minute
        gameLog->update(apmLog->current);

        if (gameLog->current) {
            // There is an ongoing session. Update to server
            networkHandler->updateSession(gameLog->current);

        } else {
            // No games are active, report no session to remove previous sessions
            // and store current apm
            networkHandler->reportNoSession(apmLog->current);
        }
    }

    // Notify observers
    emit updated(apmLog->current, gameLog->current);

    // Update timer to keep within 1 second period
    int msec = QTime::currentTime().msec();
    if (msec < 500)
        timer->setInterval(1000-msec);
    else
        timer->setInterval(2000-msec);
}

void GameLogger::networkError(QString errorStr)
{
    QDEBUG("[GameLogger::networkError()] called with error %s", qPrintable(errorStr));

    // Propagate error to UI
    emit error(errorStr);
}
