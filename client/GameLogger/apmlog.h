#ifndef APMLOG_H
#define APMLOG_H

#include <QObject>

class APMLog
{
public:
    APMLog(qint32 bufferSize, qint32 serverTime);
    ~APMLog();

    // Should be called once in a second
    // returns true if buffer is full and it should be sent
    bool update();

    // current APM
    int current;

    // APM buffer
    int *buffer;
    int bufferSize;

private:
    int lastKeyboardCount;
    int lastMouseCount;

    // Buffer to store actions for each second.
    // Used to efficiently calculate 60 sec sum
    int sec[60];
    int secPos;

    int bufferPos;       
};

#endif // APMLOG_H
