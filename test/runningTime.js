var calcRunningTime = (startHour, startMinutes, startAmpm, endHour, endMinutes, endAmpm) => {
	var to24Hours = function (time, ampm) {
		if (ampm == 'AM' && time == 12)
			time = 0;
		else if (ampm == 'PM' && time != 12)
			time = Number(time) + 12;
		return time;
	};
	startHour = to24Hours(startHour, startAmpm);
	endHour = to24Hours(endHour, endAmpm);

	//handle special case where end is before start
	if (endHour < startHour)
		endHour = Number(endHour) + 24;

	// calc running time
	runningTime = (endHour - startHour) * 60 + (endMinutes - startMinutes);
	if (runningTime == 0)
		runningTime = 24 * 60;
	return runningTime;
};

console.log(calcRunningTime('12', '00', 'AM', '12', '00', 'PM')); // 720
console.log(calcRunningTime('12', '00', 'AM', '12', '00', 'AM')); // 1440
console.log(calcRunningTime('12', '00', 'PM', '12', '00', 'PM')); // 1440
console.log(calcRunningTime('12', '00', 'PM', '12', '05', 'PM')); // 5
console.log(calcRunningTime('2', '00', 'AM', '1', '00', 'AM')); // 1380
console.log(calcRunningTime('2', '00', 'PM', '1', '00', 'PM')); // 1380
