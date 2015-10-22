var R = require('ramda');

/*
	Time is represented on the 24-hour clock by an object like {hour: h, minutes: m}
 */

var time = {
	to24Hour: function(time, ampm) {
		var time24 = R.clone(time);
		time24.hour = Number(time24.hour);
		time24.minutes = Number(time24.minutes);
		if (ampm == 'AM' && time.hour == 12)
			time24.hour = 0;
		else if (ampm == 'PM' && time.hour != 12)
			time24.hour = Number(time.hour) + 12;
		return time24;
	},
	addHours: function(t, hours) {
		var newTime = R.clone(t);
		newTime.hour = t.hour + hours;
		while (newTime.hour >= 24)
			newTime.hour -= 24;
		return newTime;
	},
	addMinutes: function(t, minutes) {
		var newTime = R.clone(t);
		newTime.minutes = t.minutes + minutes;
		while (newTime.minutes >= 60)
		{
			newTime.minutes -= 60;
			newTime = time.addHours(newTime, 1);
		}
		return newTime;
	},
	add: function(t, hours, minutes) {
		var newTime = time.addHours(t, hours);
		return time.addMinutes(newTime, minutes);
	},
	toMinutes: function(t) {
		return t.hour * 60 + t.minutes;
	},
	duration: function(start, end) {
		var duration = time.toMinutes(end) - time.toMinutes(start);
		if (duration < 0)
			duration -= 1440;
		return duration;
	},
	now: function() {
		var now = new Date();
		return {hour: now.getHours(), minutes: now.getMinutes()};
	}
};

module.exports = time;