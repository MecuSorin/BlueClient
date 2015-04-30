#include <SoftwareSerial.h>  

int bluetoothTx = 4;  // TX-O pin of bluetooth mate, Arduino D2
int bluetoothRx = 3;  // RX-I pin of bluetooth mate, Arduino D3
int relayDigi = 2;
bool isOn = true;
char Message[20];
int index = 0;
bool eom = false;
long Countdown = 2147483000;
int AlarmDuration = 1000;

SoftwareSerial bluetooth(bluetoothTx, bluetoothRx);

void setup(){
  Serial1.begin(9600);//default baundrate from my bluetooth hc-06
  Serial.begin(9600);//if you want to send data to pc
    bluetooth.begin(115200);  // The Bluetooth Mate defaults to 115200bps
  bluetooth.print("$$$");  // Enter command mode
  delay(100);  // Short delay, wait for the Mate to send back CMD
  bluetooth.println("U,9600,N");  // Temporarily Change the baudrate to 9600, no parity
  // 115200 can be too fast at times for NewSoftSerial to relay the data reliably
  bluetooth.begin(9600);  // Start bluetooth serial at 9600
  pinMode(relayDigi, OUTPUT);  
}

int ReadStringFromSerial()
{
  char inChar;
  while (Serial1.available())
    {
      inChar = Serial1.read(); // Read a character     
      
      if (inChar == '#') eom = true;
      if(index < 19) // One less than the size of the array
      {          
          Message[index++] = inChar; // Store it
      }  
    }
  return index;  
}

void setCountdownFromDevice(int o_hours, int o_minutes)
{
  Countdown = (((long)(long)o_hours * 3600 + (long)o_minutes * 60) * 1000 + millis());
}

void setCountdownToNextDay()
{
  Countdown = (long)86400000 + millis();
}

int CtoI(char input)
{
   return (int)(input - 48);
}

void alarm()
{
   digitalWrite(relayDigi, HIGH);    
   delay(AlarmDuration);
   digitalWrite(relayDigi, LOW);
   setCountdownToNextDay();
}

void ParseAndSet()
{
  Serial.write((Message));
  int lol = CtoI(Message[0]);
  switch (lol)
  {
    case 1:
      AlarmDuration = 1000;
      break;
    case 2:
      AlarmDuration = 4000;
      break;
    case 3: 
      AlarmDuration = 8000;
      break;
    default : 
      break;  
  }
  
  if (Message[1] != '_') return;
  if (Message[4] != ':') return;
  int hours = 10* CtoI(Message[2]) + CtoI(Message[3]);
  int minutes = 10* CtoI(Message[5]) + CtoI(Message[6]);    
  
  setCountdownFromDevice(hours, minutes);
  
}  

void loop(){
if (Countdown < millis())
{
  alarm();
}

if(Serial1.available()){ 
    int readChars = 0;
    readChars = ReadStringFromSerial();
    
    //delay(100);
    if (eom == true)
    {
      ParseAndSet();
      //Serial.write(Message);      
      index = 0;
      eom = false; 
    }
  }
}
