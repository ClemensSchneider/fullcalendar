
function AgendaEventRenderer() {
	var t = this;
	
	
	// exports
	t.renderEvents = renderEvents;
	t.compileDaySegs = compileDaySegs; // for DayEventRenderer
	t.clearEvents = clearEvents;
	t.slotSegHtml = slotSegHtml;
	t.bindDaySeg = bindDaySeg;
	
	
	// imports
	DayEventRenderer.call(t);
	var opt = t.opt;
	var trigger = t.trigger;
	//var setOverflowHidden = t.setOverflowHidden;
	var isEventDraggable = t.isEventDraggable;
	var isEventResizable = t.isEventResizable;
	var eventEnd = t.eventEnd;
	var reportEvents = t.reportEvents;
	var reportEventClear = t.reportEventClear;
	var eventElementHandlers = t.eventElementHandlers;
	var setHeight = t.setHeight;
	var getDaySegmentContainer = t.getDaySegmentContainer;
	var getSlotSegmentContainer = t.getSlotSegmentContainer;
	var getHoverListener = t.getHoverListener;
	var getMaxMinute = t.getMaxMinute;
	var getMinMinute = t.getMinMinute;
	var timePosition = t.timePosition;
	var colContentLeft = t.colContentLeft;
	var colContentRight = t.colContentRight;
	var renderDaySegs = t.renderDaySegs;
	var resizableDayEvent = t.resizableDayEvent; // TODO: streamline binding architecture
	var getColCnt = t.getColCnt;
	var getColWidth = t.getColWidth;
	var getGranularityHeight = t.getGranularityHeight;
	var getGranularityMinutes = t.getGranularityMinutes;
	var getBodyContent = t.getBodyContent;
	var reportEventElement = t.reportEventElement;
	var showEvents = t.showEvents;
	var hideEvents = t.hideEvents;
	var eventDrop = t.eventDrop;
	var eventResize = t.eventResize;
	var renderDayOverlay = t.renderDayOverlay;
	var clearOverlays = t.clearOverlays;
	var calendar = t.calendar;
	var formatDate = calendar.formatDate;
	var formatDates = calendar.formatDates;
	var timeLineInterval;
	
	
	
	/* Rendering
	----------------------------------------------------------------------------*/
	

	function renderEvents(events, modifiedEventId) {
		reportEvents(events);
		var i, len=events.length,
			dayEvents=[],
			slotEvents=[];
		for (i=0; i<len; i++) {
			if (events[i].allDay) {
				dayEvents.push(events[i]);
			}else{
				slotEvents.push(events[i]);
			}
		}
		if (opt('allDaySlot')) {
			renderDaySegs(compileDaySegs(dayEvents), modifiedEventId);
			setHeight(); // no params means set to viewHeight
		}
		renderSlotSegs(compileSlotSegs(slotEvents), modifiedEventId);
		
		if (opt('currentTimeIndicator')) {
			window.clearInterval(timeLineInterval);
			timeLineInterval = window.setInterval(setTimeIndicator, 30000);
			setTimeIndicator();
		}
		
		trigger('eventAfterAllRender');
	}
	
	
	function clearEvents() {
		reportEventClear();
		getDaySegmentContainer().empty();
		getSlotSegmentContainer().empty();
	}
	
	
	function compileDaySegs(events) {
		var levels = stackSegs(sliceSegs(events, $.map(events, exclEndDay), t.visStart, t.visEnd), opt),
			i, levelCnt=levels.length, level,
			j, seg,
			segs=[];
		for (i=0; i<levelCnt; i++) {
			level = levels[i];
			for (j=0; j<level.length; j++) {
				seg = level[j];
				seg.row = 0;
				seg.level = i; // not needed anymore
				segs.push(seg);
			}
		}
		return segs;
	}
	
	
	function compileSlotSegs(events) {
		var colCnt = getColCnt(),
			minMinute = getMinMinute(),
			maxMinute = getMaxMinute(),
			d = addMinutes(cloneDate(t.visStart), minMinute),
			visEventEnds = $.map(events, slotEventEnd),
			i, col,
			j, level,
			k, seg,
			segs=[];
		for (i=0; i<colCnt; i++) {
			col = stackSegs(sliceSegs(events, visEventEnds, d, addMinutes(cloneDate(d), maxMinute-minMinute)), opt);
			countForwardSegs(col);
			for (j=0; j<col.length; j++) {
				level = col[j];
				for (k=0; k<level.length; k++) {
					seg = level[k];
					seg.col = i;
					seg.level = j;
					segs.push(seg);
				}
			}
			addDays(d, 1, true);
		}
		return segs;
	}
	
	
	function slotEventEnd(event) {
		if (event.end) {
			return cloneDate(event.end);
		}else{
			return addMinutes(cloneDate(event.start), opt('defaultEventMinutes'));
		}
	}
	
	
	// renders events in the 'time slots' at the bottom
	
	function renderSlotSegs(segs, modifiedEventId) {
	
		var i, segCnt=segs.length, seg,
			event,
			classes,
			top, bottom,
			colI, levelI, forward,
			leftmost,
			availWidth,
			outerWidth,
			left,
			html='',
			eventElements,
			eventElement,
			triggerRes,
			vsideCache={},
			hsideCache={},
			key, val,
			contentElement,
			height,
			slotSegmentContainer = getSlotSegmentContainer(),
			rtl, dis, dit,
			colCnt = getColCnt(),
			overlapping = colCnt > 1;
			
		if (rtl = opt('isRTL')) {
			dis = -1;
			dit = colCnt - 1;
		}else{
			dis = 1;
			dit = 0;
		}
			
		// calculate position/dimensions, create html
		for (i=0; i<segCnt; i++) {
			seg = segs[i];
			event = seg.event;
			top = timePosition(seg.start, seg.start);
			bottom = timePosition(seg.start, seg.end);
			colI = seg.col;
			levelI = seg.level;
			forward = seg.forward || 0;
			leftmost = colContentLeft(colI*dis + dit);
			availWidth = colContentRight(colI*dis + dit) - leftmost;
			if (opt('selectionSpacer')) {
				availWidth = Math.min(availWidth-6, availWidth*.95); // TODO: move this to CSS
			}
			if (opt('ignoreEventOverlap')) {
				// ignore overlapping events and render them all with full width.
				outerWidth = availWidth;
				left = leftmost; // leftmost possible
			} else {
				if (levelI) {
					// indented and thin
					outerWidth = availWidth / (levelI + forward + 1);
				}else{
					if (forward) {
						if (overlapping) {	// moderately wide, aligned left still
							outerWidth = ((availWidth / (forward + 1)) - (12/2)) * 2; // 12 is the predicted width of resizer =
						}else{
							outerWidth = outerWidth = availWidth / (forward + 1);
						}
					}else{
						// can be entire width, aligned left
						outerWidth = availWidth;
					}
				}
				left = leftmost +                                  // leftmost possible
					(availWidth / (levelI + forward + 1) * levelI) // indentation
					* dis + (rtl ? availWidth - outerWidth : 0);   // rtl
			}
			seg.top = top;
			seg.left = left;
			seg.outerWidth = outerWidth - (overlapping ? 0 : 1);
			seg.outerHeight = bottom - top;
			html += slotSegHtml(event, seg);
		}
		slotSegmentContainer[0].innerHTML = html; // faster than html()
		eventElements = slotSegmentContainer.children();
		
		// retrieve elements, run through eventRender callback, bind event handlers
		for (i=0; i<segCnt; i++) {
			seg = segs[i];
			event = seg.event;
			eventElement = $(eventElements[i]); // faster than eq()
			triggerRes = trigger('eventRender', event, event, eventElement);
			if (triggerRes === false) {
				eventElement.remove();
			}else{
				if (triggerRes && triggerRes !== true) {
					eventElement.remove();
					eventElement = $(triggerRes)
						.css({
							position: 'absolute',
							top: seg.top,
							left: seg.left
						})
						.appendTo(slotSegmentContainer);
				}
				seg.element = eventElement;
				if (event._id === modifiedEventId) {
					bindSlotSeg(event, eventElement, seg);
				}else{
					eventElement[0]._fci = i; // for lazySegBind
				}
				reportEventElement(event, eventElement);
			}
		}
		
		lazySegBind(slotSegmentContainer, segs, bindSlotSeg);
		
		// record event sides and title positions
		for (i=0; i<segCnt; i++) {
			seg = segs[i];
			if (eventElement = seg.element) {
				val = vsideCache[key = seg.key = cssKey(eventElement[0])];
				seg.vsides = val === undefined ? (vsideCache[key] = vsides(eventElement, true)) : val;
				val = hsideCache[key];
				seg.hsides = val === undefined ? (hsideCache[key] = hsides(eventElement, true)) : val;
				contentElement = eventElement.find('div.fc-event-content');
				if (contentElement.length) {
					seg.contentTop = contentElement[0].offsetTop;
				}
			}
		}
		
		// set all positions/dimensions at once
		for (i=0; i<segCnt; i++) {
			seg = segs[i];
			if (eventElement = seg.element) {
				eventElement[0].style.width = Math.max(0, seg.outerWidth - seg.hsides) + 'px';
				height = Math.max(0, seg.outerHeight - seg.vsides);
				eventElement[0].style.height = height + 'px';
				event = seg.event;
				if (opt('moveEventTitleToEventTimeIfNoRoom') && seg.contentTop !== undefined && height - seg.contentTop < 10) {
					// not enough room for title, put it in the time (TODO: maybe make both display:inline instead)
					eventElement.find('div.fc-event-time')
						.text(formatDate(event.start, opt('timeFormat')) + ' - ' + event.title);
					eventElement.find('div.fc-event-title')
						.remove();
				}
				trigger('eventAfterRender', event, event, eventElement);
			}
		}
					
	}
	
	
	function slotSegHtml(event, seg) {
		var html = "<";
		var url = event.url;
		var skinCss = getSkinCss(event, opt);
		var skinCssAttr = (skinCss ? " style='" + skinCss + "'" : '');
		var classes = ['fc-event', 'fc-event-skin', 'fc-event-vert'];
		if (isEventDraggable(event)) {
			classes.push('fc-event-draggable');
		}
		if (seg.isStart) {
			classes.push('fc-corner-top');
		}
		if (seg.isEnd) {
			classes.push('fc-corner-bottom');
		}
		classes = classes.concat(event.className);
		if (event.source) {
			classes = classes.concat(event.source.className || []);
		}
		if (url) {
			html += "a href='" + htmlEscape(event.url) + "'";
		}else{
			html += "div";
		}
		html +=
			" class='" + classes.join(' ') + "'" +
			" style='position:absolute;z-index:8;top:" + seg.top + "px;left:" + seg.left + "px;" + skinCss + "'" +
			">";
		if (!opt('createEmptyAgendaEvents')) {
			html +=
				"<div class='fc-event-inner fc-event-skin'" + skinCssAttr + ">";
			if (opt('allowResizeTop') && seg.isStart && isEventResizable(event)) {
				html +=
					"<div class='ui-resizable-handle ui-resizable-n'>=</div>";
			}
			html +=
				"<div class='fc-event-head fc-event-skin'" + skinCssAttr + ">" +
				"<div class='fc-event-time'>" +
				htmlEscape(formatDates(event.start, event.end, opt('timeFormat'))) +
				"</div>" +
				"</div>" +
				"<div class='fc-event-content'>" +
				"<div class='fc-event-title'>" +
				htmlEscape(event.title) +
				"</div>" +
				"</div>" +
				"<div class='fc-event-bg'></div>" +
				"</div>"; // close inner
			if (seg.isEnd && isEventResizable(event)) {
				html +=
					"<div class='ui-resizable-handle ui-resizable-s'>=</div>";
			}
		}
		html +=
			"</" + (url ? "a" : "div") + ">";
		return html;
	}
	
	
	function bindDaySeg(event, eventElement, seg) {
		if (isEventDraggable(event)) {
			draggableDayEvent(event, eventElement, seg.isStart);
		}
		if (seg.isEnd && isEventResizable(event)) {
			resizableDayEvent(event, eventElement, seg);
		}
		eventElementHandlers(event, eventElement);
			// needs to be after, because resizableDayEvent might stopImmediatePropagation on click
	}
	
	
	function bindSlotSeg(event, eventElement, seg) {
		var timeElement = eventElement.find('div.fc-event-time');
		if (isEventDraggable(event)) {
			draggableSlotEvent(event, eventElement, timeElement);
		}
		if (((seg.isStart && opt('allowResizeTop')) || seg.isEnd) && isEventResizable(event)) {
			resizableSlotEvent(event, eventElement, timeElement);
		}
		eventElementHandlers(event, eventElement);
	}
	
	
	// draw a horizontal line indicating the current time (#143)
	function setTimeIndicator()
	{
		var container = getBodyContent();
		var timeline = container.children('.fc-timeline');
		if (timeline.length == 0) { // if timeline isn't there, add it
			timeline = $('<hr>').addClass('fc-timeline').appendTo(container);
		}

		var cur_time = new Date();
		if (t.visStart < cur_time && t.visEnd > cur_time) {
			timeline.show();
		}
		else {
			timeline.hide();
			return;
		}

		var secs = (cur_time.getHours() * 60 * 60) + (cur_time.getMinutes() * 60) + cur_time.getSeconds();
		var percents = secs / 86400; // 24 * 60 * 60 = 86400, # of seconds in a day

		timeline.css('top', Math.floor(container.height() * percents - 1) + 'px');

		if (t.name == 'agendaWeek') { // week view, don't want the timeline to go the whole way across
			var daycol = $('.fc-today', t.element);
			var left = daycol.position().left + 1;
			var width = daycol.width();
			timeline.css({ left: left + 'px', width: width + 'px' });
		}
	}
	
	
	/* Dragging
	-----------------------------------------------------------------------------------*/
	
	
	// when event starts out FULL-DAY
	
	function draggableDayEvent(event, eventElement, isStart) {
		var origWidth;
		var origZIndex = eventElement.zIndex();
		var revert;
		var allDay=true;
		var dayDelta;
		var dis = opt('isRTL') ? -1 : 1;
		var hoverListener = getHoverListener();
		var colWidth = getColWidth();
		var granularityHeight = getGranularityHeight();
		var granularityMinutes = getGranularityMinutes();
		var minMinute = getMinMinute();
		eventElement.draggable({
			zIndex: origZIndex + 1,
			opacity: opt('dragOpacity', 'month'), // use whatever the month view was using
			revertDuration: opt('dragRevertDuration'),
			start: function(ev, ui) {
				trigger('eventDragStart', eventElement, event, ev, ui);
				hideEvents(event, eventElement);
				origWidth = eventElement.width();
				hoverListener.start(function(cell, origCell, rowDelta, colDelta) {
					clearOverlays();
					if (cell) {
						//setOverflowHidden(true);
						revert = false;
						dayDelta = colDelta * dis;
						if (!cell.row) {
							// on full-days
							renderDayOverlay(
								addDays(cloneDate(event.start), dayDelta),
								addDays(exclEndDay(event), dayDelta)
							);
							resetElement();
						}else{
							// mouse is over bottom slots
							if (isStart) {
								if (allDay) {
									// convert event to temporary slot-event
									eventElement.width(colWidth - 10); // don't use entire width
									setOuterHeight(
										eventElement,
										granularityHeight * Math.round(
											(event.end ? ((event.end - event.start) / MINUTE_MS) : opt('defaultEventMinutes')) /
												granularityMinutes
										)
									);
									eventElement.draggable('option', 'grid', [colWidth, 1]);
									allDay = false;
								}
							}else{
								revert = true;
							}
						}
						revert = revert || (allDay && !dayDelta);
					}else{
						resetElement();
						//setOverflowHidden(false);
						revert = true;
					}
					eventElement.draggable('option', 'revert', revert);
				}, ev, 'drag');
			},
			stop: function(ev, ui) {
				hoverListener.stop();
				clearOverlays();
				trigger('eventDragStop', eventElement, event, ev, ui);
				if (revert) {
					// hasn't moved or is out of bounds (draggable has already reverted)
					resetElement();
					eventElement.css('filter', ''); // clear IE opacity side-effects
					showEvents(event, eventElement);
				}else{
					// changed!
					var minuteDelta = 0;
					if (!allDay) {
						minuteDelta = Math.round((eventElement.offset().top - getBodyContent().offset().top) / granularityHeight)
							* granularityMinutes
							+ minMinute
							- (event.start.getHours() * 60 + event.start.getMinutes());
					}
					eventDrop(this, event, dayDelta, minuteDelta, allDay, ev, ui);
				}
				//setOverflowHidden(false);
			}
		});
		function resetElement() {
			if (!allDay) {
				eventElement
					.width(origWidth)
					.height('')
					.draggable('option', 'grid', null);
				allDay = true;
			}
		}
	}
	
	
	// when event starts out IN TIMESLOTS
	
	function draggableSlotEvent(event, eventElement, timeElement) {
		var origPosition;
		var origZIndex = eventElement.zIndex();
		var allDay=false;
		var dayDelta;
		var minuteDelta;
		var prevMinuteDelta;
		var dis = opt('isRTL') ? -1 : 1;
		var hoverListener = getHoverListener();
		var colCnt = getColCnt();
		var colWidth = getColWidth();
		var granularityHeight = getGranularityHeight();
		var granularityMinutes = getGranularityMinutes();

		var scroll = opt('scrollWhileDragging');
		var prevTimeText = timeElement.text();
		
		eventElement.draggable({
			zIndex: origZIndex + 1,
			scroll: scroll,
			grid: [colWidth, granularityHeight],
			axis: colCnt==1 ? 'y' : false,
			opacity: opt('dragOpacity'),
			revertDuration: opt('dragRevertDuration'),
			start: function(ev, ui) {
				trigger('eventDragStart', eventElement, event, ev, ui);
				hideEvents(event, eventElement);
				origPosition = eventElement.position();
				// fixes wrong positioning upon revert
				ui.originalPosition.top = origPosition.top;
				ui.originalPosition.left = origPosition.left;
				minuteDelta = prevMinuteDelta = 0;
				hoverListener.start(function(cell, origCell, rowDelta, colDelta) {
					eventElement.draggable('option', 'revert', !cell);
					clearOverlays();
					if (cell) {
						dayDelta = colDelta * dis;
						if (opt('allDaySlot') && !cell.row) {
							// over full days
							if (!allDay) {
								// convert to temporary all-day event
								allDay = true;
								timeElement.hide();
								eventElement.draggable('option', 'grid', null);
							}
							renderDayOverlay(
								addDays(cloneDate(event.start), dayDelta),
								addDays(exclEndDay(event), dayDelta)
							);
						}else{
							// on slots
							resetElement();
						}
					}
				}, ev, 'drag');
			},
			drag: function(ev, ui) {
				if (scroll) {
		        	// reposition to grid
					ui.position.top = origPosition.top + Math.floor((ui.position.top - origPosition.top) / granularityHeight) * granularityHeight;
		        }
				ui.position.left = origPosition.left + (dayDelta * dis) * colWidth;
				minuteDelta = Math.round((ui.position.top - origPosition.top) / granularityHeight) * granularityMinutes;

				if (!allDay) {
					updateTimeText(minuteDelta);
				}
				prevMinuteDelta = minuteDelta;
			},
			stop: function(ev, ui) {
				var cell = hoverListener.stop();
				clearOverlays();
				trigger('eventDragStop', eventElement, event, ev, ui);
				var revertAfterDropCallback = function() {
					ui.helper.animate(ui.originalPosition, function() {
						resetElement();
						eventElement.css('filter', ''); // clear IE opacity side-effects
						eventElement.css(origPosition); // sometimes fast drags make event revert to wrong position
						timeElement.text(prevTimeText);
						showEvents(event, eventElement);
					});
				};
				if (cell && (dayDelta || minuteDelta || allDay)) {
					// changed!
					eventDrop(this, event, dayDelta, allDay ? 0 : minuteDelta, allDay, ev, ui, revertAfterDropCallback);
				}else{
					// either no change or out-of-bounds (draggable has already reverted)
					revertAfterDropCallback();
				}
			}
		});
		function updateTimeText(minuteDelta) {
			var newStart = addMinutes(cloneDate(event.start), minuteDelta);
			var newEnd;
			if (event.end) {
				newEnd = addMinutes(cloneDate(event.end), minuteDelta);
			}
			timeElement.text(formatDates(newStart, newEnd, opt('timeFormat')));
		}
		function resetElement() {
			// convert back to original slot-event
			if (allDay) {
				timeElement.css('display', ''); // show() was causing display=inline
				eventElement.draggable('option', 'grid', [colWidth, granularityHeight]);
				allDay = false;
			}
		}
	}
	
	
	
	/* Resizing
	--------------------------------------------------------------------------------------*/
	
	
	function resizableSlotEvent(event, eventElement, timeElement) {
		var granularityDelta, prevGranularityDelta;
		var granularityHeight = getGranularityHeight();
		var granularityMinutes = getGranularityMinutes();
		
		var minutesDelta = 0;
		var origZIndex = eventElement.zIndex();		
		var usedHandle;
		var origTimeText = timeElement.text();
		var initialHeight;
		eventElement.resizable({
			handles: {
				s: 'div.ui-resizable-s',
				n: 'div.ui-resizable-n'
			},
			grid: granularityHeight,
			start: function(ev, ui) {
				granularityDelta = prevGranularityDelta = 0;
				hideEvents(event, eventElement);
				eventElement.zIndex(origZIndex + 1);
				if ($(ev.originalEvent.target).hasClass("ui-resizable-s")) {
					usedHandle = 's';
				} else {
					usedHandle = 'n';
				}
				initialHeight = eventElement.height();
				if (usedHandle === 'n') {
					var diffToSlotGrid = (ui.originalPosition.top + 1) % granularityHeight;
					if (diffToSlotGrid) {
						var heightDiff = Math.round(diffToSlotGrid / granularityHeight) ? granularityHeight - diffToSlotGrid : -1 * diffToSlotGrid;
						// north handle used, adjust position.top of element to match current grid-size
						ui.originalPosition.top = (ui.originalPosition.top) + heightDiff;
						ui.originalSize.height = ui.originalSize.height - heightDiff;
					}
				} else {
					var diffToSlotGrid = (ui.originalPosition.top + 1 + eventElement.outerHeight()) % granularityHeight;
					if (diffToSlotGrid) {
						var heightDiff = Math.round(diffToSlotGrid / granularityHeight) ? granularityHeight - diffToSlotGrid : -1 * diffToSlotGrid;
						// south handle used, adjust height of element to match current grid-size
						ui.originalSize.height = eventElement.height() + heightDiff;
					}
				}
				trigger('eventResizeStart', this, event, ev, ui);
			},
			resize: function(ev, ui) {
				// don't rely on ui.size.height, doesn't take grid into account
				granularityDelta = (eventElement.height() - initialHeight) / granularityHeight;				
				
				if (granularityDelta != prevGranularityDelta) {
					var minutesDiffExact = Math.round(granularityMinutes * granularityDelta);
					var minutesRoundedDiff = 0;
					var eventStartDate = event.start;
					if (usedHandle === 'n') {
						eventStartDate = addMinutes(cloneDate(event.start), -1 * minutesDiffExact);
						minutesRoundedDiff = roundToGranularityMinutes(eventStartDate);
					}
					var eventEndDate = event.end;
					if (granularityDelta && eventEndDate && usedHandle === 's') {
						eventEndDate = addMinutes(eventEnd(event), minutesDiffExact);
						minutesRoundedDiff = roundToGranularityMinutes(eventEndDate);
					}
					
					minutesDelta = minutesDiffExact - minutesRoundedDiff;
					
					timeElement.text(
						formatDates(
							eventStartDate,
							eventEndDate,
							opt('timeFormat')
						)
					);
					prevGranularityDelta = granularityDelta;
				}
				trigger('eventResizeProgress', this, event, ev, ui);
			},
			stop: function(ev, ui) {
				trigger('eventResizeStop', this, event, ev, ui);
				if (granularityDelta) {
					eventResize(this, event, 0, minutesDelta, ev, ui, usedHandle === 'n');
				}else{
					timeElement.text(origTimeText);
					eventElement.zIndex(origZIndex);
					showEvents(event, eventElement);
					// BUG: if event was really short, need to put title back in span
				}
			}
		});
	}
	
	function roundToGranularityMinutes(date) {
		if (!date) {
			return 0;
		}
		var granularityMinutes = getGranularityMinutes();
		var dateMinutes = Math.round(date.getTime() / 1000 / 60);
		var dateMinutesRounded = Math.round(dateMinutes / granularityMinutes) * granularityMinutes;
		date.setTime(dateMinutesRounded * 60 * 1000);
		return dateMinutesRounded - dateMinutes;
	}
	

}


function countForwardSegs(levels) {
	var i, j, k, level, segForward, segBack;
	for (i=levels.length-1; i>0; i--) {
		level = levels[i];
		for (j=0; j<level.length; j++) {
			segForward = level[j];
			for (k=0; k<levels[i-1].length; k++) {
				segBack = levels[i-1][k];
				if (segsCollide(segForward, segBack)) {
					segBack.forward = Math.max(segBack.forward||0, (segForward.forward||0)+1);
				}
			}
		}
	}
}


