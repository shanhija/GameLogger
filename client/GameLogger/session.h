#ifndef SESSION_H
#define SESSION_H

#include <QDateTime>

class Session
{
public:
    Session(QString game, QString name) :
        game(game),
        gameName(name),
        apm(0),
        apmSum(0),
        updateCount(0),
        begun(QDateTime::currentDateTime()),
        updated(QDateTime::currentDateTime())
    {}


    void update(int apm) {
        updateCount++;
        updated = QDateTime::currentDateTime();
        this->apm = apm;
        apmSum += apm;
    }

    // Game session information
    QString game;
    QString gameName;

    // How many updates the game has been running. Used to calculate average APM.
    qint32 updateCount;
    qint32 apmSum;

    int apm;

    QDateTime begun;
    QDateTime updated;


};

#endif // SESSION_H
