let highlightedMarker = null;
fetch('/fish-data')
  .then(response => response.json())
  .then(data => {
    // Extract headers
    const headers = data.values[0];

    // Transform data.values directly into array of objects
    data.values = data.values.slice(1).map(row => {
      const obj = {};
      for (let i = 0; i < headers.length; i++) {
        obj[headers[i]] = row[i];
      }
      return obj;
    });

    initMap(data.values);

  });




async function initMap(data) {  


 
  const { Map } = await google.maps.importLibrary("maps");
  const { AdvancedMarkerElement, PinElement } = await google.maps.importLibrary("marker");

  // 1. Get User Location (with Permission Check)
  let userPosition;

  if (navigator.geolocation) {
    try {
      const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject);
      });
      userPosition = {
        lat: position.coords.latitude,
        lng: position.coords.longitude
      };
    } catch (error) {
      console.error('Error getting user location:', error);
      userPosition = { lat: 60.4518, lng: 22.2486 }; // Default location if error
    }
  } else {
    userPosition = { lat: 60.4518, lng: 22.2486 }; // Default location
  }

  //userPosition = { lat: 60.4518, lng: 22.2486 }; // Default location
  //create map
  const map = new google.maps.Map(document.getElementById("map"), {
    mapTypeControl: false,
    keyboardShortcuts: false,
    disableDefaultUI: true,
    streetViewControl: false,
    setClickableIcons: false, 
    zoom: 13,
    center: userPosition,
    mapId: "b0a68813e3ded0db", // Replace with your actual Map ID
  });

  

  const titleControlDiv = document.createElement('div');
  titleControlDiv.classList.add('text-body'); // Add the class here
  titleControlDiv.innerHTML = '<h1><span class="text-content">LULALA</span></h1>'; 
  

  const mapContainer = document.getElementById("map");
  mapContainer.appendChild(titleControlDiv);




  //for loop data into markers
  for (const event of data) {
       
    const markme = new google.maps.marker.AdvancedMarkerElement({
      map,
      content: buildContent(event),
      position: { lat: Number(event.LAT), lng: Number(event.LNG) },
      title: event["TITLE"],
      
    });
    
    markme.addListener("click", (event) => { 
      toggleHighlight(markme, event);
      if (event.target === markme.content) {
        event.stopPropagation();
    }
    });

  

  map.addListener("click", (event) => {
    // This event will trigger when ANYWHERE on the map is clicked
    if (highlightedMarker && event.domEvent.target !== highlightedMarker.content) {
      toggleHighlight(null); // Unhighlight the previously highlighted marker
    }
  });

  
}
}



function toggleHighlight(markerView) {
  // Unhighlight any previously highlighted marker
  if (highlightedMarker) {
      highlightedMarker.content.classList.remove("highlight");
      highlightedMarker.zIndex = null;
  }

  // If markerView is not null, then it is a new marker being highlighted.
  if(markerView){
    // Highlight the newly clicked marker
    markerView.content.classList.add("highlight");
    markerView.zIndex = 1;
    highlightedMarker = markerView; 
  } else{
    // If markerView is null, no new marker is being highlighted, simply remove highlight from the previous marker
    highlightedMarker = null;
  }
}


function buildContent(event) {

  const content = document.createElement("div");
  content.classList.add("event");

  let currentTime =  moment();
  let startorStarted = "Starts: "
  let typeColorVar = "null";
  const timeOptions = { hour: '2-digit', minute: '2-digit' };
  const timeTwoDigit = new Date(event.START).toLocaleTimeString(undefined, timeOptions);
  const startMoment = moment(new Date(event.START));
  const endMoment = moment(new Date(event.END));
  const countdownElement = document.createElement("div");

  function updateCountdown() {
    let targetTime = startMoment;
    let countdownType = "Starting:";
    if (currentTime.isBetween(startMoment, endMoment) || endMoment.diff(currentTime) <= 0) {
      targetTime = endMoment;
      countdownType = "Ending:";
    }
    const duration = moment.duration(targetTime.diff(currentTime));
    countdownElement.textContent = `${countdownType} ${duration.hours()}h ${duration.minutes()}m`;
  }

  updateCountdown();


  //switch case deciding what color the marker is
  switch (event.GENRE) {
    case "Jazz":
        content.classList.add("musicType-Jazz");
        typeColorVar = "jazzColor";
        break;

    case "Rock":
        content.classList.add("musicType-Rock");
        typeColorVar = "rockColor"
        break;

    case "HipHop": 
        content.classList.add("musicType-HipHop"); // New class
        typeColorVar = "hiphopColor"
        break;

    case "DJ":
        content.classList.add("musicType-DJ");
        typeColorVar = "djColor"
        break;

    default:
        // content.classList.add("nomarker");
        // No class added for the default (blue) state 
}








  switch (true) {
    case currentTime.isBetween(startMoment, endMoment) && endMoment.diff(currentTime, 'minutes') <= 60:
        content.classList.add("ending-soon");
        console.log("check4");
        startorStarted = "Started: "
        break;

    case currentTime.isBetween(startMoment, endMoment):
        content.classList.add("ongoing");
        startorStarted = "Started: "
        console.log("check3");
        break;

    case startMoment.isSame(currentTime, 'day') && startMoment.diff(currentTime, 'minutes') > 60: 
        // Starts today, but NOT within the next 60 minutes
        //content.classList.add("starting-today"); // New class
        // content.classList.add("starting-soon");
        console.log("check1");
        break;

    case startMoment.isAfter(currentTime) && startMoment.diff(currentTime, 'minutes') <= 60:
        content.classList.add("starting-soon");
        console.log("check2");
        break;

    default:
        content.classList.add("nomarker");
        // No class added for the default (blue) state 
}


content.innerHTML = `
<div class="icon">

    <img id="imgIcon" src="${event.GENRE}.svg" alt="${event.GENRE}" title="${event.GENRE}";>
    <span id="${typeColorVar}">${event.GENRE}</span>
</div>
<div class="details">
    <div class="eventTitle" id="${typeColorVar}">${event.TITLE}</div>

  <div class="info"> 
    <a href="https://maps.google.com/?q=${Number(event.LAT)},${Number(event.LNG)}" class="address">${event.ADDRESS} </a>
    <a href="tel:${event.NUMBER}"class="phoneNumber"> ${event.NUMBER} </a>
  </div> 
  <div class="eventMood">Mood: ${event.MOOD}</div>
  <div class="eventVenue">Venue: ${event.VENUE}</div>
   ${event.INFO ? `<div class="eventInfo">Info: ${event.INFO}</div>` : ''}

  <div class="horizontal-line"></div>
    <div class="features">
<div class="details">
        <div>${startorStarted}${timeTwoDigit}</div>
</div>  
    <div>
        <div>${countdownElement.outerHTML}</div>
    </div>
    </div>
</div>
`;




return content;



}



