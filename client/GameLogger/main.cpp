#include <QApplication>
#include <QMessageBox>
#include "gameloggerui.h"



int main(int argc, char *argv[])
{
    QApplication a(argc, argv);
    QStringList args = a.arguments();
    if (args.size() < 3) {
        QMessageBox msg;
        msg.setText("Two input arguments required: first is the user name, second is the url to settings.");
        msg.exec();
        return -1;
    }
    GameLoggerUI w(0);
    w.setup(args.at(2),args.at(1));

//    w.show();
    return a.exec();
}
