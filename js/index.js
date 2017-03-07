// draft for James' timespan idea
// https://github.com/03stories/timespan

let data = [
  {
    title: 'Camera 1',
    items: [
      {
        timestamp: 1440000000,
        type: 'photo',
        url: 'http://www.icelandprocruises.co.uk/media/img/gallery/home/0002-gallery-iceland-waterfall-1.jpg',
        title: 'landscape',
        text: 'short story long, a cool place, lorem ipsum, etc'
      },
      {
        timestamp: 1470606400,
        type: 'photo',
        url: 'http://www.icelandprocruises.co.uk/media/img/gallery/home/0002-gallery-iceland-waterfall-1.jpg',
        title: 'landscape',
        text: 'short story long, a cool place, lorem ipsum, etc'
      },
      {
        timestamp: 1470340170,
        type: 'photo',
        url: 'http://www.icelandprocruises.co.uk/media/img/gallery/home/0002-gallery-iceland-waterfall-1.jpg',
        title: 'landscape',
        text: 'short story long, a cool place, lorem ipsum, etc'
      },
      {
        timestamp: 1480340170,
        type: 'photo',
        url: 'http://www.icelandprocruises.co.uk/media/img/gallery/home/0002-gallery-iceland-waterfall-1.jpg',
        title: 'landscape',
        text: 'short story long, a cool place, lorem ipsum, etc'
      },
      {
        timestamp: 1481490170,
        type: 'photo',
        url: 'http://cdn.images.express.co.uk/img/dynamic/133/590x/travel-activity-Iceland-Northern-Lights-Reykjavik-UploadExpress-Sophie-Donnelly-637734.jpg',
        title: 'landscape',
        text: 'short story long, a cool place, lorem ipsum, etc'
      },
      {
        timestamp: 1482340170,
        type: 'photo',
        url: 'http://www.icelandprocruises.co.uk/media/img/gallery/home/0002-gallery-iceland-waterfall-1.jpg',
        title: 'landscape',
        text: 'short story long, a cool place, lorem ipsum, etc'
      },
      {
        timestamp: 1483340170,
        type: 'photo',
        url: 'http://cdn.images.express.co.uk/img/dynamic/133/590x/travel-activity-Iceland-Northern-Lights-Reykjavik-UploadExpress-Sophie-Donnelly-637734.jpg',
        title: 'landscape',
        text: 'short story long, a cool place, lorem ipsum, etc'
      },
      {
        timestamp: 1484340170,
        type: 'photo',
        url: 'http://www.icelandprocruises.co.uk/media/img/gallery/home/0002-gallery-iceland-waterfall-1.jpg',
        title: 'landscape',
        text: 'short story long, a cool place, lorem ipsum, etc'
      },
      {
        timestamp: 1485740170,
        type: 'photo',
        url: 'http://cdn.images.express.co.uk/img/dynamic/133/590x/travel-activity-Iceland-Northern-Lights-Reykjavik-UploadExpress-Sophie-Donnelly-637734.jpg',
        title: 'lights',
        text: 'amazing view of northern lights'
      },
    ]
  },
    {
    title: 'Camera 2',
    items: [
      {
        timestamp: 1486230170,
        type: 'photo',
        url: 'http://www.icelandprocruises.co.uk/media/img/gallery/home/0002-gallery-iceland-waterfall-1.jpg',
        title: 'landscape',
        text: 'short story long, a cool place, lorem ipsum, etc'
      },
      {
        timestamp: 1487340180,
        type: 'photo',
        url: 'http://cdn.images.express.co.uk/img/dynamic/133/590x/travel-activity-Iceland-Northern-Lights-Reykjavik-UploadExpress-Sophie-Donnelly-637734.jpg',
        title: 'lights',
        text: 'amazing view of northern lights'
      },
    ]
  },
  {
    title: 'Camera 3',
    items: [
      {
        timestamp: 1480110080,
        type: 'photo',
        url: 'http://cdn.images.express.co.uk/img/dynamic/133/590x/travel-activity-Iceland-Northern-Lights-Reykjavik-UploadExpress-Sophie-Donnelly-637734.jpg',
        title: 'lights',
        text: 'amazing view of northern lights'
      },
      {
        timestamp: 1481340180,
        type: 'photo',
        url: 'http://www.icelandprocruises.co.uk/media/img/gallery/home/0002-gallery-iceland-waterfall-1.jpg',
        title: 'landscape',
        text: 'short story long, a cool place, lorem ipsum, etc'
      },
      {
        timestamp: 1487340180,
        type: 'photo',
        url: 'http://cdn.images.express.co.uk/img/dynamic/133/590x/travel-activity-Iceland-Northern-Lights-Reykjavik-UploadExpress-Sophie-Donnelly-637734.jpg',
        title: 'lights',
        text: 'amazing view of northern lights'
      },
    ]
  }
];

let xScale = d3.scaleTime()
          .domain([new Date(2015, 0, 1), new Date()]) // TODO: find min/max dates from data timestamps
          .range([0, 900]); // 700px wide

let dateFormatter = d3.timeFormat('%b %e, %Y, %H:%M:%S');


let container = d3.select('.timeline-items');

// create stories/camera rows
var cameraEnter = container.selectAll('.camera').data(data)
  .enter()
    .append('div')
    .attr('class','camera')
    .on('mouseover', function () {
      d3.select(this).attr('class', 'camera active');
    })
    .on('mouseout', function () {
      d3.select(this).attr('class', 'camera');
    })
;
cameraEnter.append('div').attr('class', 'camera-title');
cameraEnter.append('div').attr('class', 'camera-items');

// set title
container.selectAll('.camera').selectAll('.camera-title').text( d => d.title );

// create items in the row
var items = container.selectAll('.camera').select('.camera-items');
let itemEnter = items.selectAll('.camera-item').data( d => d.items ) 
  .enter()
    .append('div')
    .attr('class', 'camera-item');

itemEnter
  .append('div')
  .attr('class', 'camera-item-image')
;

items.selectAll('.camera-item')
  .style('left', d => { return xScale(new Date(d.timestamp * 1000)) + 'px' })
  .attr('title', d => dateFormatter(new Date(d.timestamp * 1000)) + ': ' + d.title + ' - ' + d.text)
    .select('.camera-item-image')
  
    .html(d => {
      if (d.type === 'photo') {
        return '<img height=50 width=50 src="' + d.url + '"/>';
      } 
    })
;



// add timeline dates at the bottom
d3.select('.timeline-guide').selectAll('.tick').data(xScale.domain())
	.enter()
    .append('div')
    .attr('class', (d, i) => (i == 0 ? 'tick left' : 'tick right'))
    .text(dateFormatter)
;


// add timeline slider
let slider = d3.select('.timeline-slider');
let guide = d3.select('.timeline-guide').node();
let allItems = d3.selectAll('.camera-item');
d3.select('.timeline').on('mousemove', function() {
  // update slider position
  slider.style('left', d3.event.pageX + 'px');

  // var activeCam = d3.select('.camera');
  // activeCam.attr('class', 'camera active');
  
  // mark relevant cards active
  var xy = d3.mouse(guide);
  var dateX = xy[0];
  var date = xScale.invert(dateX);
  var mouseTimestamp = Math.floor(date.getTime()/1000);
  allItems.classed('active', d =>  Math.abs(d.timestamp - mouseTimestamp) < 500000);

  // mark relevant rows active
  // var xy = d3.mouse(guide);
  // var dateX = xy[0];
  // var date = xScale.invert(dateX);
  // var mouseTimestamp = Math.floor(date.getTime()/1000);
  // allItems.classed('active', d =>  Math.abs(d.timestamp - mouseTimestamp) < 1000000);
  
  // update details with one active item's details
  var active = d3.select('.camera.active .camera-item.active');
  if (active.size() === 0) {
    d3.select('.timeline-date').text('');
    d3.select('.timeline-title').text('');
    d3.select('.timeline-text').text('');
    d3.select('.timeline-image img').attr('src', '');
  } 
  else {
    let d = active.datum();
    d3.select('.timeline-date').text(dateFormatter(new Date(d.timestamp * 1000)));
    d3.select('.timeline-title').text(d.title);
    d3.select('.timeline-text').text(d.text);
    d3.select('.timeline-image img').attr('src', d.url);
  }
 
})