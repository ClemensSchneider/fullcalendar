
fcViews.agendaDay = AgendaDayView;

function AgendaDayView(element, calendar) {
	var t = this;
	
	
	// exports
	t.render = render;
	
	
	// imports
	AgendaView.call(t, element, calendar, 'agendaDay');
	var opt = t.opt;
	var renderAgenda = t.renderAgenda;
	var formatDate = calendar.formatDate;
	var dateManager = calendar.dateManager;
	
	
	function render(date, delta) {
		if (delta) {
			dateManager.addDays(date, delta);
			if (!opt('weekends')) {
				dateManager.skipWeekend(date, delta < 0 ? -1 : 1);
			}
		}
		var start = dateManager.cloneDate(date, true);
		var end = dateManager.addDays(dateManager.cloneDate(start), 1);
		t.title = formatDate(date, opt('titleFormat'));
		t.start = t.visStart = start;
		t.end = t.visEnd = end;
		renderAgenda(1);
	}
	

}
