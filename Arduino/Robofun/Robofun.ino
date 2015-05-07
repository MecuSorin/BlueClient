#include "SoftwareSerial.h";
int bluetoothTx = 3;
int bluetoothRx = 2;

SoftwareSerial bluetooth(bluetoothTx, bluetoothRx);

void setup()
{

  Serial.begin(9600);


  bluetooth.begin(115200);
  bluetooth.print("$$$");
  delay(100);
  bluetooth.println("U,9600,N");
  bluetooth.begin(9600);
}

void loop()
{
  if(bluetooth.available()) {
    char toSend = (char)bluetooth.read();
    Serial.print(toSend);
  }

  if(Serial.available()) {
    char toSend = (char)Serial.read();
    bluetooth.print(toSend);
  }
}
 