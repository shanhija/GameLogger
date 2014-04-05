#ifndef GAMELOG_H
#define GAMELOG_H

#include "settings.h"
#include "session.h"

class GameLog
{
public:
    GameLog(Settings *settings);

    // Current session
    Session *current;

    // Checks the open applications if any have the same name as games stored in settings
    void update(int apm);

private:
    Settings *settings;
};

#endif // GAMELOG_H
