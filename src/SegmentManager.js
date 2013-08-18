function SegmentManager(dateManager, options) {
	var t = this;
	
	t.exclEndDay = exclEndDay;
	t.segCmp = segCmp;
	t.segsCollide = segsCollide;
	t.sliceSegs = sliceSegs;
	t.stackSegs = stackSegs;
	
	function exclEndDay(event) {
		if (event.end) {
			return _exclEndDay(event.end, event.allDay);
		}else{
			return dateManager.addDays(cloneDate(event.start), 1);
		}
	}


	function _exclEndDay(end, allDay) {
		end = dateManagercloneDate(end);
		return allDay || dateManager.getHours(end) || dateManager.getMinutes(end) ? dateManager.addDays(end, 1) : dateManager.clearTime(end);
	}


	function segCmp(a, b) {
		return (b.msLength - a.msLength) * 100 + (a.event.start - b.event.start);
	}


	function segsCollide(seg1, seg2) {
		return seg1.end > seg2.start && seg1.start < seg2.end;
	}



	/* Event Sorting
	-----------------------------------------------------------------------------*/


	// event rendering utilities
	function sliceSegs(events, visEventEnds, start, end) {
		var segs = [],
			i, len=events.length, event,
			eventStart, eventEnd,
			segStart, segEnd,
			isStart, isEnd;
		for (i=0; i<len; i++) {
			event = events[i];
			eventStart = event.start;
			eventEnd = visEventEnds[i];
			if (eventEnd > start && eventStart < end) {
				if (eventStart < start) {
					segStart = dateManager.cloneDate(start);
					isStart = false;
				}else{
					segStart = eventStart;
					isStart = true;
				}
				if (eventEnd > end) {
					segEnd = dateManager.cloneDate(end);
					isEnd = false;
				}else{
					segEnd = eventEnd;
					isEnd = true;
				}
				segs.push({
					event: event,
					start: segStart,
					end: segEnd,
					isStart: isStart,
					isEnd: isEnd,
					msLength: segEnd - segStart
				});
			}
		}
		return segs.sort(segCmp);
	}


	// event rendering calculation utilities
	function stackSegs(segs) {
		var levels = [],
			i, len = segs.length, seg,
			j, collide, k;
		for (i=0; i<len; i++) {
			seg = segs[i];
			j = 0; // the level index where seg should belong
			while (true) {
				collide = false;
				if (levels[j]) {
					for (k=0; k<levels[j].length; k++) {
						if (segsCollide(levels[j][k], seg)) {
							collide = true;
							break;
						}
					}
				}
				if (collide) {
					j++;
				}else{
					break;
				}
			}
			if (levels[j]) {
				levels[j].push(seg);
			}else{
				levels[j] = [seg];
			}
		}
		return levels;
	}
}