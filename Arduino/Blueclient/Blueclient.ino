#include <SoftwareSerial.h>  

const unsigned long MaxMills = 4294967294UL;
const int pin_bluetoothTx = 3;  // Arduino D3 - Tx bluetooth
const int pin_bluetoothRx = 2;  // Arduino D2 - Rx bluetooth
const int pin_out = 13;         // Arduino led

SoftwareSerial bluetooth(pin_bluetoothTx, pin_bluetoothRx);

volatile unsigned long AlarmDurationInMills = 1000;
volatile unsigned long StartAlarmThresholdInMills = MaxMills;
volatile unsigned long EndAlarmThresholdInMills = MaxMills;
volatile int IsWarmingTheButter = 0;
const int MessageBufferSize = 20;
const int ValidMessageLength = 8;
char Message[MessageBufferSize];
volatile int messageCurrentIndex = -1;
volatile char MessageTerminatorChar = '|';
volatile char MessageInnerDelimitatorChar = '*';
volatile char StatusRequestChar = '?';

void EatGibberishFromBluetooth(unsigned long mealDurationInmills) {
  unsigned long clearBluetoothOutputThesholdInMills = millis() + mealDurationInmills;    // waiting 2secs for gibberish from bluetooth
  while(millis() < clearBluetoothOutputThesholdInMills) {
    if(bluetooth.available())
      bluetooth.read();
  }
}

void SetupBluetooth() {
  bluetooth.begin(115200);
  bluetooth.print("$$$");
  EatGibberishFromBluetooth(150UL);
  bluetooth.println("U,9600,N");
  bluetooth.begin(9600);
  EatGibberishFromBluetooth(150UL);
  bluetooth.print("$$$");
  EatGibberishFromBluetooth(3000UL);
  bluetooth.println("---");
  EatGibberishFromBluetooth(150UL);
  bluetooth.println("Ready...");
}

void setup(){
  Recharge();
  SetupBluetooth();
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
    case 1: AlarmDurationInMills = 20000UL; break;
    case 2: AlarmDurationInMills = 40000UL; break;
    case 3: AlarmDurationInMills = 60000UL; break;
    default : return false;  
  }
  return true;
}

void SetupAlarmOver(int hours, int minutes) {
  StartAlarmThresholdInMills = millis() + 60UL * 1000UL * ((unsigned long) ((hours * 60) + minutes));
  EndAlarmThresholdInMills = MaxMills;
}

bool UpdateAlarmCountdown(char hour1, char hour2, char min1, char min2) {
  if( IsNotDigit(hour1) || IsNotDigit(hour2) || IsNotDigit(min1) || IsNotDigit(min2))
    return false;   // unsupported format
  int hours = 10 * CToI(hour1) + CToI(hour2);
  int minutes = 10 * CToI(min1) + CToI(min2); 
  SetupAlarmOver(hours, minutes); 
  return true;
}

bool ParseStatusRequest() {
  return messageCurrentIndex >= 1
          && MessageTerminatorChar == Message[messageCurrentIndex]
          && StatusRequestChar == Message[-1+messageCurrentIndex];
}

bool ParseMessageAndSet() {
  if( messageCurrentIndex<7
    || MessageInnerDelimitatorChar != Message[1]
    || MessageInnerDelimitatorChar != Message[4]
    || MessageTerminatorChar != Message[ValidMessageLength-1])
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
  String toEcho = String(String(MessageTerminatorChar)+GetText(Message, ValidMessageLength));
  bluetooth.println(toEcho);
  //String toEcho = String("|"+GetText(Message, messageCurrentIndex)+"|\n");
  //bluetooth.print(MessageTerminatorChar);
  //bluetooth.print(MessageTerminatorChar);
}

void WarmTheButter() {
  IsWarmingTheButter = 1;
  pinMode(pin_out, OUTPUT); 
  digitalWrite(pin_out, HIGH);
  EndAlarmThresholdInMills = millis()+AlarmDurationInMills;
  EchoStatus();
}

void EchoStatus() {
  String status = IsWarmingTheButter ? "Warming the butter|" : "Recharging|";
  bluetooth.println(status);
}

void Recharge() {
  IsWarmingTheButter = 0;
  //pinMode(pin_out, INPUT) 
  //digitalWrite(pin_out, HIGH);
  pinMode(pin_out, OUTPUT);         //TODO to change after tests
  digitalWrite(pin_out, LOW);       //TODO to change after tests
}

void loop(){
  if(EndAlarmThresholdInMills < millis()) {
    EndAlarmThresholdInMills = MaxMills;
    Recharge();
    EchoStatus();
    return;
  }

  if (StartAlarmThresholdInMills < millis()) {
    SetupAlarmOver(0,2);  // next day   TODO to put 24h-warming interval
    WarmTheButter();
    return;
  }

  if(MessageBufferSize-1 == messageCurrentIndex) {    //flooded, drop the message
    messageCurrentIndex = -1;
    return;
  }

  if(-1 < messageCurrentIndex && MessageTerminatorChar == Message[messageCurrentIndex]) {
    if(ParseMessageAndSet()) {
      EchoMessage();
    }
    else if(ParseStatusRequest()) {
      EchoStatus();
    }
    messageCurrentIndex = -1;
    return;
  }

  ReadCharFromBluetooth();
}
