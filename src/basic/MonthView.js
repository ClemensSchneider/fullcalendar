
fcViews.month = MonthView;

function MonthView(element, calendar) {
	var t = this;
	
	
	// exports
	t.render = render;
	
	
	// imports
	BasicView.call(t, element, calendar, 'month');
	var opt = t.opt;
	var renderBasic = t.renderBasic;
	var formatDate = calendar.formatDate;
	var dateManager = calendar.dateManager;
	
	
	
	function render(date, delta) {
		if (delta) {
			dateManager.addMonths(date, delta);
			dateManager.setDate(date, 1);
		}
		var start = dateManager.cloneDate(date, true);
		dateManager.setDate(start, 1);
		var end = dateManager.addMonths(dateManager.cloneDate(start), 1);
		var visStart = dateManager.cloneDate(start);
		var visEnd = dateManager.cloneDate(end);
		var firstDay = opt('firstDay');
		var nwe = opt('weekends') ? 0 : 1;
		if (nwe) {
			dateManager.skipWeekend(visStart);
			dateManager.skipWeekend(visEnd, -1, true);
		}
		dateManager.addDays(visStart, -((dateManager.getDay(visStart) - Math.max(firstDay, nwe) + 7) % 7));
		dateManager.addDays(visEnd, (7 - dateManager.getDay(visEnd) + Math.max(firstDay, nwe)) % 7);
		var rowCnt = Math.round((visEnd - visStart) / (DAY_MS * 7));
		if (opt('weekMode') == 'fixed') {
			dateManager.addDays(visEnd, (6 - rowCnt) * 7);
			rowCnt = 6;
		}
		t.title = formatDate(start, opt('titleFormat'));
		t.start = start;
		t.end = end;
		t.visStart = visStart;
		t.visEnd = visEnd;
		renderBasic(rowCnt, nwe ? 5 : 7, true);
	}
	
	
}
