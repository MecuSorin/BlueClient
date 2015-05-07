volatile unsigned long delayTimeOutInMills = 0;
volatile int delayStatus = DelayStatus.Iddle
enum DelayStatus {
	Iddle, Started
}

void StartDelayInMills(unsigned long millsToWait, function somethingToRunOnDelayTimeOut) {
	delayTimeOutInMills = mills() + millsToWait;

	delayStatus = DelayStatus.Started;
}

// in loop verificam daca a trecut timpul necesar ....
if( delayStatus.Started && mills() > delayTimeOutInMills) {
	// event to process something
	somethingToRunOnDelayTimeOut();
	delayStatus = DelayStatus.Iddle; // inhiba alte delays
}


// start delay
StartDelayInMills(1000);


