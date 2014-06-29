#-------------------------------------------------
#
# Project created by QtCreator 2014-04-05T13:56:27
#
#-------------------------------------------------

QT      += core gui network
LIBS    += -L'C:/Development/WINDOW~1/8.1/Lib/winv6.3/um/8x86/' -lpsapi -luser32 -lXinput
INCLUDEPATH += C:/Development/WINDOW~1/8.1/Include/um
INCLUDEPATH += C:/Development/WINDOW~1/8.1/Include/shared

greaterThan(QT_MAJOR_VERSION, 4): QT += widgets

TARGET = GameLogger
TEMPLATE = app

debug {

#    DEFINES += MY_DEBUG
}

SOURCES += main.cpp\
    networkhandler.cpp \
    gameloggerui.cpp \
    settings.cpp \
    apmlog.cpp \
    gamelog.cpp \
    gamelogger.cpp

HEADERS  += \
    networkhandler.h \
    gameloggerui.h \
    settings.h \
    common.h \
    apmlog.h \
    gamelog.h \
    session.h \
    gamelogger.h

FORMS    += \
    gameloggerui.ui

RESOURCES += \
    gamelogger.qrc
