#ifndef COMMON_H
#define COMMON_H

#include <QtDebug>

#ifdef MY_DEBUG
#define QDEBUG qDebug
#else
#define QDEBUG(fmt,...) ((void)0)
#endif

#define VERSION QString("3.1")
#define VERSION_CONTEXT QString("Summerkampf 2014")

#endif // COMMON_H
