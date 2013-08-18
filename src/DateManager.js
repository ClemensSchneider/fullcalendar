function DateManager(options) {
	var t = this;
	
	t.getYear = getYear;
	t.setYear = setYear;
	t.getFullYear = getFullYear;
	t.setFullYear = setFullYear;
	t.getMonth = getMonth;
	t.setMonth = setMonth;
	t.getDate = getDate;
	t.setDate = setDate;
	t.getDay = getDay;
	t.getHours = getHours;
	t.setHours = setHours;
	t.getMinutes = getMinutes;
	t.setMinutes = setMinutes;
	t.getSeconds = getSeconds;
	t.setSeconds = setSeconds;
	t.getMilliseconds = getMilliseconds;
	t.setMilliseconds = setMilliseconds;
	
	t.addYears = addYears;
	t.addMonths = addMonths;
	t.addDays = addDays;
	t.fixDate = fixDate;
	t.addMinutes = addMinutes;
	t.clearTime = clearTime;
	t.cloneDate = cloneDate;
	t.zeroDate = zeroDate;
	t.skipWeekend = skipWeekend;
	t.dayDiff = dayDiff;
	t.setYMD = setYMD;
	t.parseDate = parseDate;
	t.parseISO8601 = parseISO8601;
	t.parseTime = parseTime;
	t.formatDate = formatDate;
	t.formatDates = formatDates;
	
	function setYear(date, value) {
		options.utcMode ? date.setUTCYear(value) : date.setYear(value);
	}
	function getYear(date) {
		return options.utcMode ? date.getUTCYear() : date.getYear();
	}
	
	function setFullYear(date, value) {
		options.utcMode ? date.setUTCFullYear(value) : date.setFullYear(value);
	}
	function getFullYear(date) {
		return options.utcMode ? date.getUTCFullYear() : date.getFullYear();
	}
	
	function setMonth(date, value) {
		options.utcMode ? date.setUTCMonth(value) : date.setMonth(value);
	}
	function getMonth(date) {
		return options.utcMode ? date.getUTCMonth() : date.getMonth();
	}
	
	function setDate(date, value) {
		options.utcMode ? date.setUTCDate(value) : date.setDate(value);
	}
	function getDate(date) {
		return options.utcMode ? date.getUTCDate() : date.getDate();
	}
	
	function getDay(date) {
		return options.utcMode ? date.getUTCDay() : date.getDay();
	}
	
	function setHours(date, value) {
		options.utcMode ? date.setUTCHours(value) : date.setHours(value);
	}
	function getHours(date) {
		return options.utcMode ? date.getUTCHours() : date.getHours();
	}
	
	function setMinutes(date, value) {
		options.utcMode ? date.setUTCMinutes(value) : date.setMinutes(value);
	}
	function getMinutes(date) {
		return options.utcMode ? date.getUTCMinutes() : date.getMinutes();
	}
	
	function setSeconds(date, value) {
		options.utcMode ? date.setUTCSeconds(value) : date.setSeconds(value);
	}
	function getSeconds(date) {
		return options.utcMode ? date.getUTCSeconds() : date.getSeconds();
	}
	
	function setMilliseconds(date, value) {
		options.utcMode ? date.setUTCMilliseconds(value) : date.setMilliseconds(value);
	}
	function getMilliseconds(date) {
		return options.utcMode ? date.getUTCMilliseconds() : date.getMilliseconds();
	}

	function addYears(d, n, keepTime) {
		setFullYear(d, getFullYear(d) + n);
		if (!keepTime) {
			clearTime(d);
		}
		return d;
	}


	function addMonths(d, n, keepTime) { // prevents day overflow/underflow
		if (+d) { // prevent infinite looping on invalid dates
			var m = getMonth(d) + n,
				check = cloneDate(d);
			setDate(check, 1);
			setMonth(check, m);
			setMonth(d, m);
			if (!keepTime) {
				clearTime(d);
			}
			while (getMonth(d) != getMonth(check)) {
				setDate(d, getDate(d) + (d < check ? 1 : -1));
			}
		}
		return d;
	}


	function addDays(d, n, keepTime) { // deals with daylight savings
		if (+d) {
			var dd = getDate(d) + n,
				check = cloneDate(d);
			setHours(check, 9); // set to middle of day
			setDate(check, dd);
			setDate(d, dd);
			if (!keepTime) {
				clearTime(d);
			}
			fixDate(d, check);
		}
		return d;
	}


	function fixDate(d, check) { // force d to be on check's YMD, for daylight savings purposes
		if (+d) { // prevent infinite looping on invalid dates
			while (getDate(d) != getDate(check)) {
				d.setTime(+d + (d < check ? 1 : -1) * HOUR_MS);
			}
		}
	}


	function addMinutes(d, n) {
		setMinutes(d, getMinutes(d) + n);
		return d;
	}


	function clearTime(d) {
		setHours(d, 0);
		setMinutes(d, 0);
		setSeconds(d, 0); 
		setMilliseconds(d, 0);
		return d;
	}


	function cloneDate(d, dontKeepTime) {
		if (dontKeepTime) {
			return clearTime(new Date(+d));
		}
		return new Date(+d);
	}


	function zeroDate() { // returns a Date with time 00:00:00 and dateOfMonth=1
		var i=0, d;
		do {
			if (options.utcMode) {
				d = new Date(0);
			} else {
				d = new Date(1970, i++, 1);
			}
		} while (getHours(d)); // != 0
		return d;
	}


	function skipWeekend(date, inc, excl) {
		inc = inc || 1;
		while (!getDay(date) || (excl && getDay(date)==1 || !excl && getDay(date)==6)) {
			addDays(date, inc);
		}
		return date;
	}


	function dayDiff(d1, d2) { // d1 - d2
		return Math.round((cloneDate(d1, true) - cloneDate(d2, true)) / DAY_MS);
	}


	function setYMD(date, y, m, d) {
		if (y !== undefined && y != getFullYear(date)) {
			setDate(date, 1);
			setMonth(date, 0);
			setFullYear(date, y);
		}
		if (m !== undefined && m != getMonth(date)) {
			setDate(date, 1);
			setMonth(date, m);
		}
		if (d !== undefined) {
			setDate(date, d);
		}
	}



	/* Date Parsing
	-----------------------------------------------------------------------------*/


	function parseDate(s, ignoreTimezone) { // ignoreTimezone defaults to true
		if (typeof s == 'object') { // already a Date object
			return s;
		}
		if (typeof s == 'number') { // a UNIX timestamp
			return new Date(s * 1000);
		}
		if (typeof s == 'string') {
			if (s.match(/^\d+(\.\d+)?$/)) { // a UNIX timestamp
				return new Date(parseFloat(s) * 1000);
			}
			if (ignoreTimezone === undefined) {
				ignoreTimezone = true;
			}
			return parseISO8601(s, ignoreTimezone) || (s ? new Date(s) : null);
		}
		// TODO: never return invalid dates (like from new Date(<string>)), return null instead
		return null;
	}


	function parseISO8601(s, ignoreTimezone) { // ignoreTimezone defaults to false
		// derived from http://delete.me.uk/2005/03/iso8601.html
		// TODO: for a know glitch/feature, read tests/issue_206_parseDate_dst.html
		var m = s.match(/^([0-9]{4})(-([0-9]{2})(-([0-9]{2})([T ]([0-9]{2}):([0-9]{2})(:([0-9]{2})(\.([0-9]+))?)?(Z|(([-+])([0-9]{2})(:?([0-9]{2}))?))?)?)?)?$/);
		if (!m) {
			return null;
		}
		var date = new Date(m[1], 0, 1);
		if (ignoreTimezone || !m[13]) {
			var check = new Date(m[1], 0, 1, 9, 0);
			if (m[3]) {
				setMonth(date, m[3] - 1);
				setMonth(check, m[3] - 1);
			}
			if (m[5]) {
				setDate(date, m[5]);
				setDate(check, m[5]);
			}
			fixDate(date, check);
			if (m[7]) {
				setHours(date, m[7]);
			}
			if (m[8]) {
				setMinutes(date, m[8]);
			}
			if (m[10]) {
				setSeconds(date, m[10]);
			}
			if (m[12]) {
				setMilliseconds(date, Number("0." + m[12]) * 1000);
			}
			fixDate(date, check);
		}else{
			setFullYear(date,
				m[1],
				m[3] ? m[3] - 1 : 0,
				m[5] || 1
			);
			setHours(date,
				m[7] || 0,
				m[8] || 0,
				m[10] || 0,
				m[12] ? Number("0." + m[12]) * 1000 : 0
			);
			if (m[14]) {
				var offset = Number(m[16]) * 60 + (m[18] ? Number(m[18]) : 0);
				offset *= m[15] == '-' ? 1 : -1;
				date = new Date(+date + (offset * 60 * 1000));
			}
		}
		return date;
	}


	function parseTime(s) { // returns minutes since start of day
		if (typeof s == 'number') { // an hour
			return s * 60;
		}
		if (typeof s == 'object') { // a Date object
			return getHours(s) * 60 + getMinutes(s);
		}
		var m = s.match(/(\d+)(?::(\d+))?\s*(\w+)?/);
		if (m) {
			var h = parseInt(m[1], 10);
			if (m[3]) {
				h %= 12;
				if (m[3].toLowerCase().charAt(0) == 'p') {
					h += 12;
				}
			}
			return h * 60 + (m[2] ? parseInt(m[2], 10) : 0);
		}
	}



	/* Date Formatting
	-----------------------------------------------------------------------------*/
	// TODO: use same function formatDate(date, [date2], format, [options])


	function formatDate(date, format) {
		return formatDates(date, null, format);
	}


	function formatDates(date1, date2, format) {
		options = options || defaults;
		var date = date1,
			otherDate = date2,
			i, len = format.length, c,
			i2, formatter,
			res = '';
		for (i=0; i<len; i++) {
			c = format.charAt(i);
			if (c == "'") {
				for (i2=i+1; i2<len; i2++) {
					if (format.charAt(i2) == "'") {
						if (date) {
							if (i2 == i+1) {
								res += "'";
							}else{
								res += format.substring(i+1, i2);
							}
							i = i2;
						}
						break;
					}
				}
			}
			else if (c == '(') {
				for (i2=i+1; i2<len; i2++) {
					if (format.charAt(i2) == ')') {
						var subres = formatDate(date, format.substring(i+1, i2));
						if (parseInt(subres.replace(/\D/, ''), 10)) {
							res += subres;
						}
						i = i2;
						break;
					}
				}
			}
			else if (c == '[') {
				for (i2=i+1; i2<len; i2++) {
					if (format.charAt(i2) == ']') {
						var subformat = format.substring(i+1, i2);
						var subres = formatDate(date, subformat);
						if (subres != formatDate(otherDate, subformat)) {
							res += subres;
						}
						i = i2;
						break;
					}
				}
			}
			else if (c == '{') {
				date = date2;
				otherDate = date1;
			}
			else if (c == '}') {
				date = date1;
				otherDate = date2;
			}
			else {
				for (i2=len; i2>i; i2--) {
					if (formatter = dateFormatters[format.substring(i, i2)]) {
						if (date) {
							res += formatter(date, options);
						}
						i = i2 - 1;
						break;
					}
				}
				if (i2 == i) {
					if (date) {
						res += c;
					}
				}
			}
		}
		return res;
	};

	var dateFormatters = {
		s	: function(d)	{ return getSeconds(d) },
		ss	: function(d)	{ return zeroPad(getSeconds(d)) },
		m	: function(d)	{ return getMinutes(d) },
		mm	: function(d)	{ return zeroPad(getMinutes(d)) },
		h	: function(d)	{ return getHours(d) % 12 || 12 },
		hh	: function(d)	{ return zeroPad(getHours(d) % 12 || 12) },
		H	: function(d)	{ return getHours(d) },
		HH	: function(d)	{ return zeroPad(getHours(d)) },
		d	: function(d)	{ return getDate(d) },
		dd	: function(d)	{ return zeroPad(getDate(d)) },
		ddd	: function(d,o)	{ return o.dayNamesShort[getDay(d)] },
		dddd: function(d,o)	{ return o.dayNames[getDay(d)] },
		M	: function(d)	{ return getMonth(d) + 1 },
		MM	: function(d)	{ return zeroPad(getMonth(d) + 1) },
		MMM	: function(d,o)	{ return o.monthNamesShort[getMonth(d)] },
		MMMM: function(d,o)	{ return o.monthNames[getMonth(d)] },
		yy	: function(d)	{ return (getFullYear(d)+'').substring(2) },
		yyyy: function(d)	{ return getFullYear(d) },
		t	: function(d)	{ return getHours(d) < 12 ? 'a' : 'p' },
		tt	: function(d)	{ return getHours(d) < 12 ? 'am' : 'pm' },
		T	: function(d)	{ return getHours(d) < 12 ? 'A' : 'P' },
		TT	: function(d)	{ return getHours(d) < 12 ? 'AM' : 'PM' },
		u	: function(d)	{ return formatDate(d, "yyyy-MM-dd'T'HH:mm:ss'Z'", options) },
		S	: function(d)	{
			var date = getDate(d);
			if (date > 10 && date < 20) {
				return 'th';
			}
			return ['st', 'nd', 'rd'][date%10-1] || 'th';
		},
		w   : function(d, o) { // local
			return o.weekNumberCalculation(d);
		},
		W   : function(d) { // ISO
			return iso8601Week(d);
		}
	};


	/* thanks jQuery UI (https://github.com/jquery/jquery-ui/blob/master/ui/jquery.ui.datepicker.js)
	 * 
	 * Set as calculateWeek to determine the week of the year based on the ISO 8601 definition.
	 * `date` - the date to get the week for
	 * `number` - the number of the week within the year that contains this date
	 */
	var iso8601Week = function(date) {
		var checkDate = cloneDate(date);
		// Find Thursday of this week starting on Monday
		setDate(checkDate, getDate(checkDate) + 4 - (getDay(checkDate) || 7));
		var time = checkDate.getTime();
		setMonth(checkDate, 0); // Compare with Jan 1
		setDate(checkDate, 1);
		return Math.floor(Math.round((time - checkDate) / 86400000) / 7) + 1;
	};
}
