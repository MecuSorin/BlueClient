#include <SoftwareSerial.h>

// https://www.sparkfun.com/products/10393
#define BUFFER_SIZE 64
 
int bluetoothTx = 2;  // TX-O pin of bluetooth mate, Arduino D2
int bluetoothRx = 3;  // RX-I pin of bluetooth mate, Arduino D3

SoftwareSerial bluetooth(bluetoothTx, bluetoothRx);
 
void setup() 
{ 
  Serial1.begin(9600);
  setupBluetooth();
  Serial1.println("\nChat Sparkfun Version\n");
} 

unsigned char buf[BUFFER_SIZE] = {0};
unsigned char len = 0;

void loop() {
  if (bluetooth.available()) {
    Serial1.write("Them: ");
    while (bluetooth.available()) {
      Serial1.write(bluetooth.read());
    }
  }
 
  while (Serial1.available()) {
    unsigned char c = Serial1.read();
    if (c == 0xA || c == 0xD) { // \n or \r
      sendData();
    } else {
      bufferData(c);
    }
  }

}

void bufferData(char c) {
  if (len < BUFFER_SIZE) {
    buf[len++] = c;
  } // TODO warn, or send data
}

void sendData() {
  Serial1.write("Us: ");
  for (int i = 0; i < len; i++) {
    bluetooth.write(buf[i]);
    Serial1.write(buf[i]);
  }
  bluetooth.write(0xA);
  bluetooth.write(0xD);
  Serial1.write(0xA); // TODO test on windows
  len = 0;
  bluetooth.flush();  
} 
 
void setupBluetooth() {
  bluetooth.begin(115200);  // The Bluetooth Mate defaults to 115200bps
//return;
  bluetooth.print("$$$");  // Enter command mode
  delay(100);  // Short delay, wait for the Mate to send back CMD
  bluetooth.println("U,9600,N");  // Temporarily Change the baudrate to 9600, no parity
  // 115200 can be too fast at times for NewSoftSerial to relay the data reliably
  delay(250);
  bluetooth.begin(9600);  // Start bluetooth serial at 9600
}




