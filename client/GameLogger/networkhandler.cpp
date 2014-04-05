#include "networkhandler.h"
#include "common.h"

NetworkHandler::NetworkHandler(Settings *settings) : settings(settings)
{

}

void NetworkHandler::networkError(QNetworkReply::NetworkError code) {
    QDEBUG("[NetworkHandler::networkError()] called");
    int i = 0;
    while (i < replyList.size()) {
        QNetworkReply *r = replyList.at(i);
        if (r->error() != QNetworkReply::NoError) {
            QDEBUG("[NetworkHandler::networkError()] emitting error %s", qPrintable(r->errorString()));
            emit error(r->errorString());
            r->deleteLater();
            replyList.removeAt(i);
        } else {
            ++i;
        }
    }
}

void NetworkHandler::networkDummyFinished() {
    QDEBUG("[NetworkHandler::networkDummyFinished()] called");
    int i = 0;
    while (i < replyList.size()) {
        QNetworkReply *r = replyList.at(i);
        if (r->isFinished()) {
            r->deleteLater();
            replyList.removeAt(i);
        } else {
            ++i;
        }
    }
}

void NetworkHandler::submitRequest(QNetworkRequest req)
{
    QDEBUG("[NetworkHandler::submitRequest()] called with URL: %s", qPrintable(req->url().toString()));
    QNetworkReply * rep = qnam.get(req);
    replyList.append(rep);
    connect(rep, SIGNAL(error(QNetworkReply::NetworkError)), this, SLOT(networkError(QNetworkReply::NetworkError)));
    connect(rep, SIGNAL(finished()), this, SLOT(networkDummyFinished()) );
}

void NetworkHandler::querySettings() {
    reply = qnam.get(QNetworkRequest(QUrl(settings->serverUrl + "/clientConnect.php?request=settings")));
    QDEBUG("[NetworkHandler::querySettings()] reply contructed");
    connect(reply, SIGNAL(error(QNetworkReply::NetworkError)), this, SLOT(networkError(QNetworkReply::NetworkError)));
    connect(reply, SIGNAL(finished()), this, SLOT(readSettings()));
    QDEBUG("[NetworkHandler::querySettings()] exiting ");
}

void NetworkHandler::readSettings()
{
    QDEBUG("[NetworkHandler::readSettings()] called");
    if (reply->error() != QNetworkReply::NoError) {
        emit error(reply->errorString());
        reply->deleteLater();
        return;
    }
    QString data = QString(reply->readAll());
    settings->parseSettings(data);
    QDEBUG("[NetworkHandler::readSettings()] settings read");
}



void NetworkHandler::updateSession(Session *session)
{
    QDEBUG("[NetworkHandler::updateSession()] updating session for %s",qPrintable(settings->games[session->game]->completeName));

    QUrl url(settings->serverUrl + "/clientConnect.php");

    QUrlQuery query;

    query.addQueryItem("request", "updateSession");
    query.addQueryItem("player", settings->player);
    query.addQueryItem("gameid", QString::number(settings->games[session->game]->id));
    query.addQueryItem("apm", QString::number(session->apm));
    query.addQueryItem("apmsum", QString::number(session->apmSum));
    query.addQueryItem("updates", QString::number(session->updateCount));

    url.setQuery(query.query());

    submitRequest(QNetworkRequest(url));
}

void NetworkHandler::reportNoSession(int apm)
{
    QDEBUG("[NetworkHandler::reportNoSession()] called");

    QUrl url(settings->serverUrl + "/clientConnect.php");

    QUrlQuery query;

    query.addQueryItem("request", "reportNoSession");
    query.addQueryItem("player", settings->player);
    if (apm > 0)
        query.addQueryItem("apm", QString::number(apm));

    url.setQuery(query.query());

    submitRequest(QNetworkRequest(url));
}

void NetworkHandler::sendAPM(int *buffer, int size)
{
    QDEBUG("[NetworkHandler::sendAPM()] sending APM");

    QUrl url(settings->serverUrl + "/clientConnect.php");

    QUrlQuery query;

    query.addQueryItem("request", "updateAPM");
    query.addQueryItem("player", settings->player);
    QString apm = QString::number(buffer[0]);
    for (int i = 1; i < size; ++i) {
        apm += ',';
        apm += QString::number(buffer[i]);
    }
    query.addQueryItem("apm", apm);

    url.setQuery(query.query());

    submitRequest(QNetworkRequest(url));
}

