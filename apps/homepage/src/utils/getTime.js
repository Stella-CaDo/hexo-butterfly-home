export function getCurrentTime(now = new Date()) {
  const pad = n => String(n).padStart(2, '0');
  return { year: now.getFullYear(), month: pad(now.getMonth()+1), day: pad(now.getDate()), hour: pad(now.getHours()), minute: pad(now.getMinutes()), second: pad(now.getSeconds()), weekday: ['星期日','星期一','星期二','星期三','星期四','星期五','星期六'][now.getDay()] };
}

export function getTimeCapsule(now = new Date()) {
  const year = now.getFullYear(), month = now.getMonth(), day = now.getDate();
  const midnight = new Date(year,month,day);
  const monday = new Date(year,month,day - (now.getDay()+6)%7);
  const ranges = {
    day: ['今日', midnight, new Date(year,month,day+1), 3600000],
    week: ['本周', monday, new Date(monday.getFullYear(),monday.getMonth(),monday.getDate()+7), 86400000],
    month: ['本月', new Date(year,month,1), new Date(year,month+1,1), 86400000],
    year: ['本年', new Date(year,0,1), new Date(year+1,0,1), 86400000],
  };
  return Object.fromEntries(Object.entries(ranges).map(([key,[name,start,end,unit]]) => {
    const elapsed = now-start, duration=end-start;
    return [key,{name,passed:Math.floor(elapsed/unit),remaining:Math.ceil((end-now)/unit),percentage:Math.min(100,Math.max(0,100*elapsed/duration)).toFixed(2)}];
  }));
}

export function siteDateStatistics(startDate) {
  const days = Math.max(0,Math.floor((Date.now()-startDate.getTime())/86400000));
  return Number.isFinite(days) ? `本站已记录 ${days} 天` : '';
}
