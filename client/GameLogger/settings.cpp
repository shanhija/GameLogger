#include "settings.h"
#include "common.h"

Settings::Settings(QString serverUrl, QString player): serverUrl(serverUrl), player(player)
{
    ready = false;
}

void Settings::parseSettings(QString data)
{
    QStringList lines = data.split("\n");
    QDEBUG("[Settings::readSettings()] settings data split to %d lines",lines.size());
    for (int i = 0; i < lines.size(); ++i) {
        QString line = lines.at(i).trimmed();

        if (line.length() == 0) {
            QDEBUG("[Settings::readSettings()] empty at %d",i);
            continue;
        }
        if (line.at(0)=='!') {
            // Comment line
            QDEBUG("[Settings::readSettings()] comment: '%s'",qPrintable(line));

        } else if (line.at(0)== '#') {
            // General settings
            QDEBUG("[Settings::readSettings()] setting: '%s'",qPrintable(line));
            QStringList setting = line.split("\t");
            QString key = setting.at(1).toLower();

            if(!key.compare("suppressupdates")) {
                supressUpdates = true;                
                QDEBUG("[Settings::readSettings()] Suppressing updates during play");

            } else if (!key.compare("apmbuffersize")) {
                apmBufferSize = setting.at(2).toInt();                
                QDEBUG("[Settings::readSettings()] APM buffer size set to ", qPrintable(setting.at(2)));

            } else if (!key.compare("servertime")) {                
                serverTime = setting.at(2).toInt();
                QDEBUG("[Settings::readSettings()] APM buffer pos set to ", qPrintable(setting.at(2)));

            }
        } else {
            QDEBUG("[Settings::readSettings()] game   : '%s'",qPrintable(line));

            QStringList game = line.split("\t");
            GameInfo * gi = new GameInfo();

            // Settings
            gi->id = game.at(0).toInt();
            gi->exeName = game.at(1).toLower();
            gi->completeName = game.at(2);
            gi->logoUrl = game.at(3);

            // Store game
            games[gi->exeName] = gi;
        }
    }
    ready = true;
    QDEBUG("[Settings::readSettings()] read %d games. exiting... ",games.size());
}
