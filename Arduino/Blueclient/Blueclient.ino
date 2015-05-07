#include <SoftwareSerial.h>  

const unsigned long MaxMills = 4294967294UL;
const int pin_bluetoothTx = 3;  // Arduino D3 - Tx bluetooth
const int pin_bluetoothRx = 2;  // Arduino D2 - Rx bluetooth
const int pin_out = 13;         // Arduino led

SoftwareSerial bluetooth(pin_bluetoothTx, pin_bluetoothRx);

volatile unsigned long AlarmDurationInMills = 1000;
volatile unsigned long StartAlarmThresholdInMills = MaxMills;

const int MessageBufferSize = 20;
char Message[MessageBufferSize];
volatile int messageCurrentIndex = -1;
volatile char MessageTerminatorChar = '#';

void SetupBluetooth() {
  bluetooth.begin(115200);
  bluetooth.print("$$$");
  delay(100);
  bluetooth.println("U,9600,N");
  bluetooth.begin(9600);
}

void setup(){
  //Serial.begin(9600);
  SetupBluetooth();
  pinMode(pin_out, OUTPUT);  
}

void ReadCharFromBluetooth() {
  if(bluetooth.available())
  {
    char inChar = (char)bluetooth.read(); // Read a character     
    if(messageCurrentIndex + 2 <= MessageBufferSize) // One less than the size of the array
    {          
      Message[++messageCurrentIndex] = inChar; // Store it
    }  
  }
}

bool IsNotDigit(char value) {
  return '0' > value || value > '9';
}

int CToI(char value) {
  return (int)value - 48;
}

bool UpdateTemperatureSetting(char suggestedValue) {
  switch (CToI(suggestedValue))
  {
    case 1: AlarmDurationInMills = 1000UL; break;
    case 2: AlarmDurationInMills = 4000UL; break;
    case 3: AlarmDurationInMills = 8000UL; break;
    default : return false;  
  }
  return true;
}

void SetupAlarmOver(int hours, int minutes) {
  StartAlarmThresholdInMills = millis() + 60UL * 1000UL * ((unsigned long) ((hours * 60) + minutes));
}

bool UpdateAlarmCountdown(char hour1, char hour2, char min1, char min2) {
  if( IsNotDigit(hour1) || IsNotDigit(hour2) || IsNotDigit(min1) || IsNotDigit(min2))
    return false;   // unsupported format
  int hours = 10 * CToI(hour1) + CToI(hour2);
  int minutes = 10 * CToI(min1) + CToI(min2); 
  SetupAlarmOver(hours, minutes); 
  return true;
}

bool ParseMessageAndSet() {
  if( messageCurrentIndex<7
    || '_' != Message[1]
    || ':' != Message[4]
    || MessageTerminatorChar != Message[7])
    return false; // invalid message format
  if( !UpdateTemperatureSetting(Message[0]))
    return false; // invalid temperature setting
  return UpdateAlarmCountdown(Message[2], Message[3], Message[5], Message[6]);
}

String GetText(char *source, int elements) {
  String copy(source);
  return copy.substring(0, elements);
}

void EchoMessage() {
  bluetooth.print(GetText(Message, messageCurrentIndex));
  /*for(int i=0; i<= messageCurrentIndex; i++) {
    bluetooth.write(Message[i]);

    //Serial.print(Message[i]);
  }
  //bluetooth.write('\n');
  */
}

void SmothTheButter() {
  digitalWrite(pin_out, !digitalRead(pin_out));
  //Serial.println("smothing the butter :p");
  bluetooth.println("smothing the butter :p");
  /*digitalWrite(pin_out, HIGH);    
  delay(AlarmDurationInMills);
  digitalWrite(pin_out, LOW);*/
}

void loop(){
  if (StartAlarmThresholdInMills < millis()) {
    StartAlarmThresholdInMills = MaxMills;
    SmothTheButter();
    SetupAlarmOver(0, 1);      // next day   TODO to put 24h-smothing interval
    return;
  }

  if(MessageBufferSize-1 == messageCurrentIndex) {    //flooded, drop the message
    messageCurrentIndex = -1;
    return;
  }

  if(-1 < messageCurrentIndex && MessageTerminatorChar == Message[messageCurrentIndex]) {
    ParseMessageAndSet(); //      if (ParseMessageAndSet())
      EchoMessage();
    messageCurrentIndex = -1;
    return;
  }

  ReadCharFromBluetooth();
}
