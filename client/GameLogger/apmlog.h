#ifndef APMLOG_H
#define APMLOG_H

#include <QObject>
#include <QTimer>

#define GAMEPAD_CHECK_FPS 20
#define GAMEPAD_SEARCH_INTERVAL_SEC 2
// How much does an analog controller have to change before a change is detected.
// Current value is 1%
#define GAMEPAD_RELATIVE_MIN_CHANGE 0.4


class APMLog
{
public:
    APMLog(qint32 bufferSize, qint32 serverTime);
    ~APMLog();

    // Should be called once in a second
    // returns true if buffer is full and it should be sent
    bool update();

    // Should be called many times a second to check the gamepad state
    void updateGamepad();

    // current APM
    int current;

    // APM buffer
    int *buffer;
    int bufferSize;        

private:
    int lastKeyboardCount;
    int lastMouseCount;

    // Gamepad reading member variables
    int gamepadIndex;
    int gamepadCheckCounter;
    int lastGamepadPacket;
    int lastGamepadCount;


    // Buffer to store actions for each second.
    // Used to efficiently calculate 60 sec sum
    int sec[60];
    int secPos;

    int bufferPos;       
};

#endif // APMLOG_H
