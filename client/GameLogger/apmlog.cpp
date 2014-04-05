#include "apmlog.h"

// #define WIN32_LEAN_AND_MEAN             // Exclude rarely-used stuff from Windows headers
#include <windows.h>
#include <psapi.h>
#include <Winbase.h>

#include "common.h"

int keyboardCounter = 0;
HHOOK keyboardHook;

int mouseCounter = 0;
HHOOK mouseHook;

LRESULT CALLBACK keyboardCounterProc(int nCode, WPARAM wParam, LPARAM lParam)
{
    if (wParam == WM_KEYUP)
        ++keyboardCounter;
    return CallNextHookEx(0, nCode, wParam, lParam);
}

LRESULT CALLBACK mouseCounterProc(int nCode, WPARAM wParam, LPARAM lParam)
{
    if ((wParam == WM_LBUTTONDOWN) || (wParam == WM_RBUTTONDOWN))
        ++mouseCounter;
    return CallNextHookEx(0, nCode, wParam, lParam);
}


APMLog::APMLog(qint32 bufferSize, qint32 serverTime)
{    
    // Set up APM counting
    this->bufferSize = bufferSize;
    buffer = new int[bufferSize];

    // Synchronize buffers between clients.
    // Since the clock on server side and the apm buffer size is common to all clients,
    // and each client sends its apm data when the ringbuffer is full
    // we only need to set the initial buffer position to the modulus of serverTime to
    // make the clients send their data during the same second
    bufferPos = serverTime % bufferSize; // Synchronize clients to send updates within the same second.

    // Initialize all variables to zero
    secPos = 0;
    current = 0;
    lastMouseCount = 0;
    lastKeyboardCount = 0;
    for (int i = 0; i < 60; ++i) {
        sec[i] = 0;
    }
    for (int i = 0; i < bufferSize; ++i) {
        buffer[i] = 0;
    }

    // Start low-level keyboard and mouse hooks to trap key and mouse presses
    keyboardHook = SetWindowsHookEx(WH_KEYBOARD_LL, keyboardCounterProc, GetModuleHandle(0), 0);
    mouseHook = SetWindowsHookEx(WH_MOUSE_LL, mouseCounterProc, GetModuleHandle(0), 0);
}

APMLog::~APMLog()
{
    // Detach hooks
    if (keyboardHook)
        UnhookWindowsHookEx(keyboardHook);
    if (mouseHook)
        UnhookWindowsHookEx(mouseHook);
}


bool APMLog::update()
{
    QDEBUG("[APMLog::update()] called");

    // Get actions after last call to this function
    int keyb = keyboardCounter;
    int mouse = mouseCounter;
    int diff = (keyb - lastKeyboardCount) + (mouse - lastMouseCount);
    lastKeyboardCount = keyb;
    lastMouseCount = mouse;

    // Update action count buffer
    secPos = (secPos + 1) % 60;
    current += diff - sec[secPos];
    sec[secPos] = diff;

    // Update APM buffer
    bufferPos = (bufferPos + 1) % bufferSize;
    buffer[bufferPos] = current;

    if (bufferPos == (bufferSize-1)) {
        // Buffer is filled with new APM data
        QDEBUG("[APMLog::update()] exiting with buffer full and current apm=%d", current);
        return true;
    } else {
        QDEBUG("[APMLog::update()] exiting (buffer not full) and current apm=%d", current);
        return false;
    }

}
