// draft for James' timespan idea
// https://github.com/03stories/timespan

let data = [
  {
    title: 'Camera 1',
    items: [
      {
        timestamp: 1440000000,
        type: 'photo',
        url: '../media/IMG_6679.jpg',
        title: 'IMG_6679',
        text: ''
      },
      {
        timestamp: 1471606400,
        type: 'photo',
        url: '../media/IMG_6683.jpg',
        title: 'IMG_6679',
        text: ''
      },
      {
        timestamp: 1470340170,
        type: 'photo',
        url: '../media/IMG_6728.jpg',
        title: 'IMG_6728',
        text: ''
      },
      {
        timestamp: 1480340170,
        type: 'photo',
        url: '../media/IMG_6826.jpg',
        title: 'IMG_6826',
        text: ''
      },
      {
        timestamp: 1481490170,
        type: 'photo',
        url: '../media/IMG_7016.jpg',
        title: 'IMG_7016',
        text: ''
      },
      {
        timestamp: 1482340170,
        type: 'photo',
        url: '../media/IMG_7128.jpg',
        title: 'IMG_7128',
        text: ''
      },
      {
        timestamp: 1483340170,
        type: 'photo',
        url: '../media/IMG_7130.jpg',
        title: 'IMG_7130',
        text: ''
      },
      {
        timestamp: 1484340170,
        type: 'photo',
        url: '../media/IMG_7132.jpg',
        title: 'IMG_7132',
        text: ''
      },
      {
        timestamp: 1485740170,
        type: 'photo',
        url: '../media/IMG_7233.jpg',
        title: 'IMG_7233',
        text: ''
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
        type: 'video',
        url: '../media/dog.mp4',
        title: 'lights',
        text: 'some video'
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
    // make 1 camera active based on hover
    .on('mouseover', function () { 
      d3.select(this).classed('active', true);
    })
    .on('mouseout', function () {
      d3.select(this).classed('active', false);
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
      } else if (d.type === 'video') {
        return '<img height=50 width=50 src="../media/video.jpg"/>';
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

  // mark relevant cards active
  var xy = d3.mouse(guide);
  var dateX = xy[0];
  var date = xScale.invert(dateX);
  var mouseTimestamp = Math.floor(date.getTime()/1000);
  allItems.classed('active', d =>  Math.abs(d.timestamp - mouseTimestamp) < 500000);
  
  // update details with item's details from the active camera
  var active = d3.select('.camera.active .camera-item.active');
  if (active.size() === 0) {
    d3.select('.timeline-date').text('');
    d3.select('.timeline-title').text('');
    d3.select('.timeline-text').text('');
    d3.select('.timeline-image img').attr('src', '');
    d3.select('#my-video').style('display', 'none');
    d3.select('.timeline-image video').attr('src', '');
  } 
  else {
    let d = active.datum();
    d3.select('.timeline-date').text(dateFormatter(new Date(d.timestamp * 1000)));
    d3.select('.timeline-title').text(d.title);
    d3.select('.timeline-text').text(d.text);
    if (d.type === 'photo') {
      d3.select('.timeline-image img').attr('height', '400');
      d3.select('.timeline-image img').attr('src', d.url);
    } else if (d.type === 'video') {
      d3.select('.timeline-image img').attr('height', 0);
      d3.select('.timeline-image video').attr('src', d.url);
      d3.select('.timeline-image source').attr('src', d.url);
      d3.select('#my-video').style('display', 'block');
    }
  }
 
})