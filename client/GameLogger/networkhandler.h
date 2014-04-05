#ifndef NETWORKHANDLER_H
#define NETWORKHANDLER_H

#include <QNetworkAccessManager>
#include <QtNetwork>

#include "settings.h"
#include "session.h"

class NetworkHandler: public QObject
{
    Q_OBJECT
public:
    NetworkHandler(Settings *settings);

    void querySettings();

    // Game session related functions
    void updateSession(Session *session);
    void reportNoSession(int apm);

    // APM related functions
    void sendAPM(int *buffer, int size);

signals:
    void error(QString error);

private slots:
    void networkDummyFinished();
    void networkError(QNetworkReply::NetworkError code);
    void readSettings();

private:

    void submitRequest(QNetworkRequest req);

    Settings *settings;

    QNetworkAccessManager qnam;
    QNetworkReply *reply;
    QList<QNetworkReply *> replyList;

};

#endif // NETWORKHANDLER_H
