describe('HistoryManager', function() {
  var historyManager = Barba.HistoryManager;

  it('exists', function() {
    expect(historyManager).toBeTruthy();
    expect(historyManager.states.length).toBe(0);
  });

  it('.add', function() {
    historyManager.add('url1', 'namespace1');

    expect(historyManager.states.length).toBe(1);
  });

  it('.currentStatus', function() {
    var obj = historyManager.currentStatus();

    expect(obj.url).toBe('url1');
    expect(obj.namespace).toBe('namespace1');
  });

  it('.prevStatus', function() {
    expect(historyManager.prevStatus()).toBeFalsy();

    historyManager.add('url2');

    var current = historyManager.currentStatus();
    var prev = historyManager.prevStatus();

    expect(historyManager.states.length).toBe(2);
    expect(current.url).toBe('url2');
    expect(current.namespace).toBeFalsy();
    expect(prev.url).toBe('url1');
    expect(prev.namespace).toBe('namespace1');
  });
});