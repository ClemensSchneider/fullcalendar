
fcViews.agendaWeek = AgendaWeekView;

function AgendaWeekView(element, calendar) {
	var t = this;
	
	
	// exports
	t.render = render;
	
	
	// imports
	AgendaView.call(t, element, calendar, 'agendaWeek');
	var opt = t.opt;
	var renderAgenda = t.renderAgenda;
	var formatDates = calendar.formatDates;
	var dateManager = calendar.dateManager;
	
	
	
	function render(date, delta) {
		if (delta) {
			dateManager.addDays(date, delta * 7);
		}
		var start = dateManager.addDays(dateManager.cloneDate(date), -((dateManager.getDay(date) - opt('firstDay') + 7) % 7));
		var end = dateManager.addDays(dateManager.cloneDate(start), 7);
		var visStart = dateManager.cloneDate(start);
		var visEnd = dateManager.cloneDate(end);
		var weekends = opt('weekends');
		if (!weekends) {
			dateManager.skipWeekend(visStart);
			dateManager.skipWeekend(visEnd, -1, true);
		}
		t.title = formatDates(
			visStart,
			dateManager.addDays(dateManager.cloneDate(visEnd), -1),
			opt('titleFormat')
		);
		t.start = start;
		t.end = end;
		t.visStart = visStart;
		t.visEnd = visEnd;
		renderAgenda(weekends ? 7 : 5);
	}
	

}
