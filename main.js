var bands = [];
var spData = null;
var localStoragedReatings = [];
var eventUpdateLog = [];
var bandDetailSlider;

//https://gist.github.com/terrywbrady/a03b25fe42959b304b1e
const events = [
    {
        eventId: 0,
        eventName: "Roskilde",
        eventColor: "#BADA55",
        event_db_url: "https://spreadsheets.google.com/feeds/cells/1g74O7oBzVSO_0rKN178agKng0AvSVf0MUKmK6iadSuE/1/public/values?alt=json-in-script&callback=doData"
    },
    {
        eventId: 1,
        eventName: "Copenhell",
        event_db_url: "https://spreadsheets.google.com/feeds/cells/1g74O7oBzVSO_0rKN178agKng0AvSVf0MUKmK6iadSuE/2/public/values?alt=json-in-script&callback=doData"
    }
];

//document.documentElement.style.setProperty('--your-variable', '#YOURCOLOR');

window.onload = function(){
    getSettingsFromLS();
    makeEventSelector();
    makeSortmenu();
    checkDbNeedUpdate(events[appSettings[0].eventSelected].eventId, events[appSettings[0].eventSelected].event_db_url);
}

function makeEventSelector() {
    const SelectorHTML = `
    <select onchange="changeEvent(this);" class="custom-select custom-select-lg px-4">
        ${events.map(event => `
        <option value="${event.eventId}" ${event.eventId == appSettings[0].eventSelected ? 'selected' : ''}>${event.eventName}</option>
        `).join('')}
    </select>`;
    document.getElementById('eventSelectorWrapper').innerHTML = SelectorHTML;
}  

function updateDbNow(){
    getDB(events[appSettings[0].eventSelected].event_db_url);
    var now = new Date();
    // now.setDate(now.getDate() - 1);
    // now.setHours(now.getHours() - 1);
    var y = now.getFullYear();
    var m = now.getMonth() +1;
    var d = now.getDate();
    var h = now.getHours();
    var nowArray = [d,m,y,h];
    eventUpdateLog.find(b=>b.eventId == events[appSettings[0].eventSelected].eventId).lastUpdate = nowArray;
    localStorage.setItem('eventUpdateLog', JSON.stringify(eventUpdateLog));
}

function checkDbNeedUpdate(db_id, db_url){
    var now = new Date();
    // now.setDate(now.getDate() - 1);
    // now.setHours(now.getHours() - 1);
    var y = now.getFullYear();
    var m = now.getMonth() +1;
    var d = now.getDate();
    var h = now.getHours();
    var nowArray = [d,m,y,h];

    if( localStorage.getItem("eventUpdateLog") ){
        eventUpdateLog = JSON.parse(localStorage.getItem("eventUpdateLog"));
    } 
    else {
        for (let index = 0; index < events.length; index++) {
        eventUpdateLog.push({eventId: events[index].eventId, lastUpdate: nowArray});
        }
        localStorage.setItem('eventUpdateLog', JSON.stringify(eventUpdateLog));
    }
    var eventLastUpdate = eventUpdateLog.find(b=>b.eventId == db_id).lastUpdate;
    var moreThan24h = nowArray[0] > eventLastUpdate[0] && nowArray[1] >= eventLastUpdate[1] && nowArray[2] >= eventLastUpdate[2] && nowArray[3] > eventLastUpdate[3];
    
    if(moreThan24h){
        console.log("time for update bands[]");
        getDB(db_url);
        eventUpdateLog.find(b=>b.eventId == db_id).lastUpdate = nowArray;
        localStorage.setItem('eventUpdateLog', JSON.stringify(eventUpdateLog));
    }
    else{
        if( localStorage.getItem("bandsFromStorrage") ){
            bands = JSON.parse(localStorage.getItem("bandsFromStorrage"))[db_id];  
            SortBands();
            pushReatingToBands();
            makeBandlistHTML();
        }
        else{
            getDB(db_url);
        }
    }
}

function getDB(db_url){
    console.log("getting bands[] from db");
    document.getElementById("bandlist").innerHTML = "henter bands...";
    var script = document.createElement('script');
    script.src = db_url;
    document.head.appendChild(script);
}

function doData(json) {
    spData = json.feed.entry;
    makeBands();
}

function changeEvent(_this){
    let eventId = _this.value;
    appSettings[0].eventSelected = eventId; 
    localStorage.setItem('appSettings', JSON.stringify(appSettings));
    this.document.getElementById('eventSelectedName').innerHTML = events[eventId].eventName;
    
    checkDbNeedUpdate(eventId, events[eventId].event_db_url);
}

function makeBands() {
    document.getElementById("bandlist").innerHTML = "henter data...";
    var data = spData;
    var key = 0;
    bands = [];
    for(var r=0; r<data.length; r++) {
        var cell = data[r]["gs$cell"];
        var val = cell["$t"];
        if (cell.row > 1) {
            if(cell.col == "1"){
                key = val;
                bands[key] = {id: parseInt(val)};
            }
            if(cell.col == "2"){
                bands[key].name = val;
            } 
            if(cell.col == "3"){
                bands[key].HeadlineScore = parseInt(val);
            }
            if(cell.col == "4"){
                bands[key].date = val;
            }
            if(cell.col == "5"){
                bands[key].time = val;
            }
            if(cell.col == "6"){
                bands[key].duration = parseInt(val);
            }
            if(cell.col == "7"){
                bands[key].stage = val.split("_")[0];
            }
            if(cell.col == "8"){
                bands[key].iframe = val;
            }
        }
    }
    pushReatingToBands();
    SortBands();
    makeBandlistHTML();

    var bandsFromStorrage = JSON.parse(localStorage.getItem("bandsFromStorrage")) || [];

    bandsFromStorrage[events[appSettings[0].eventSelected].eventId] = bands;
    localStorage.setItem('bandsFromStorrage', JSON.stringify(bandsFromStorrage));
}

function pushReatingToBands(){
    if( localStorage.getItem("localStoragedReatings") ){
        localStoragedReatings = JSON.parse(localStorage.getItem("localStoragedReatings"));
      } else {
          for (let index = 0; index < events.length; index++) {
            localStoragedReatings.push([]);

          }
        localStorage.setItem('localStoragedReatings', JSON.stringify(localStoragedReatings));
      }
      for (let index = 0; index < bands.length; index++) {
        var band = bands.find(function(element) {
            return element.id == index;
        });
        band.rating = localStoragedReatings[appSettings[0].eventSelected][index] ? localStoragedReatings[appSettings[0].eventSelected][index] : 0;          
      }
}

function setRating(_this, id, rating){
    _this.classList.add("activeRating");
    for (let sibling of _this.parentNode.children) {
        if (sibling !== _this) sibling.classList.remove('activeRating');
    }
    localStoragedReatings[appSettings[0].eventSelected][id] = rating;
    localStorage.setItem('localStoragedReatings', JSON.stringify(localStoragedReatings));
    
    var activeband = bands.find(band => band.id == id );
    activeband.rating = rating;
    
    var band_card = document.querySelector('.band[data-id="'+id+'"]');
    //band_card.style.display = 'block';   
    band_card.dataset.filterratingid = rating.toString();
    removeClassByPrefix(band_card.querySelector(".band-card"),"bg-")
    band_card.querySelector(".band-card").className += " " + getColor(rating);
    band_card.classList.remove()
    band_card.querySelector(".em-svg").className = 'em-svg ' + getIconName(rating);
    // if(appSettings[1].filterRatings[rating] == 0){
    //     band_card.style.display = 'none';
    // }
    return false;
}
function removeClassByPrefix(el, prefix) {
    var regx = new RegExp('\\b' + prefix + '(.*)?\\b', 'g');
    el.className = el.className.replace(regx, '');
    return el;
}

function makeBandlistHTML(){
    const bandCard_Small = 
    `${bands.map(band => `
        <div class="band row mb-2 " data-id="${band.id}" data-filterRatingId="${(band.rating)}" style="${appSettings[1].filterRatings[band.rating] == 1 ? `` : `display: none`}">
            <div class="band-card col-12 p-3 rounded ${getColor(band.rating)}">
                <div class="row d-flex flex-nowrap mx-0">
                    <div class="mr-2 bg-em p-2 rounded-circle">
                        <i class="em-svg ${getIconName(band.rating)}"></i>      
                    </div>
                    <div>
                        <h4 class="m-0">${band.name}</h4>
                        <h5 class="m-0" >${getStage(band.stage)} : Tirsdag d. 29 kl 19:00</h5>
                    </div>
                </div>
                <div class="band-details row mx-0"></div>
            </div>
        </div>  
    `).join('')}`;  
    document.getElementById("bandlist").innerHTML = bandCard_Small;
    
    let lastUpdateArray = eventUpdateLog[events[appSettings[0].eventSelected].eventId].lastUpdate;
    const bandLastUpdateHTML = `<h6><small>Band liste sidst opdateret: ${lastUpdateArray[0]}/${lastUpdateArray[1]}/${lastUpdateArray[2]} kl ${lastUpdateArray[3]}:00</small><a onclick="return updateDbNow();" class="ml-2"><i class="fas fa-sync-alt"></i></a></h6>`;
    
    document.getElementById("bandUpdate").innerHTML = bandLastUpdateHTML;
    clickOpenDetils();
}

var bandShowing = 'none';
var currentOpenBandHeight = null; 

function clickOpenDetils(){
    const allbandElements = document.querySelectorAll('.band');
    allbandElements.forEach((bandElem) => {
        bandElem.addEventListener('click', (event) => {
            if(event.target.className.length){
                if (event.target.className.indexOf("em-svg") >= 0 ) return;
            }
            var band = bands.find(x => x.id == bandElem.getAttribute('data-id'));
            if(bandShowing == 'none'){
                currentOpenBandHeight = bandElem.offsetHeight;
                showBandDetails(bandElem, band)
                bandShowing = band.id;
            }
            else if(bandShowing == band.id){
                hideBandDetails(bandElem);
                bandShowing = 'none';
            }
            else {
                hideBandDetails(document.querySelector('#bandlist .band[data-id="'+bandShowing+'"]'));
                currentOpenBandHeight = bandElem.offsetHeight;
                showBandDetails(bandElem,band);
                bandShowing = band.id;
            }
      });
    });
    function showBandDetails(bandElem, band){
        bandElem.querySelector(".band-details").innerHTML = makeBandDetailsHTML(band);
        var fullHeight = bandElem.scrollHeight;
        bandElem.querySelector(".band-details").style.display = "none"
        
        var showBandDetails = bandElem.animate([
            {
                height: currentOpenBandHeight+'px'
            }
           ,
            {
                height: fullHeight+'px'
            }
           ], {
            duration: 300,
            fill: "forwards",
            easing: 'cubic-bezier(0.2, 0, 0.2, 1)'
          });
          
           showBandDetails.onfinish = function(){
                bandElem.querySelector(".band-details").style.display = "flex";
                let wrapper = document.querySelector("#container"); // the wrapper we will scroll inside
                let count = bandElem.offsetTop - wrapper.scrollTop - document.querySelector("#header").scrollHeight  // xx = any extra distance from top ex. 60
                wrapper.scrollBy({top: count, left: 0, behavior: 'smooth'})
          }
    }
}
function hideBandDetails(bandElem){
    bandElem.querySelector(".band-details").innerHTML = "";
    var hideBandDetails = bandElem.animate([
        {
            height: '60vh'
        }
        ,
        {
            height: currentOpenBandHeight+'px'
        }
        ], {
        duration: 300,
        fill: "forwards",
        easing: 'cubic-bezier(0.2, 0, 0.2, 1)'
        });
        hideBandDetails.onfinish = function(){
            // loop troung array
            for (let index = 0; index < appSettings[1].filterRatings.length; index++) {
                if(appSettings[1].filterRatings[index] == 0){
                    var filterRatingId = index;
                    var allbandsWithRating = document.querySelectorAll("[data-filterRatingId = '"+filterRatingId+"']");
                    hideAllwithRating(allbandsWithRating);
                }
            }

        }
}

function clickCloseDetils(id){
        // hideBandDetails(document.querySelector('.band[data-id="'+id+'"]'));
        // bandShowing = 'none';
        return false;
}

function makeBandDetailsHTML(activeBand){
    return`
        <div style="position: absolute; top: 1rem; right: 1rem;">
            <a class="close-details p-2" onclick="return clickCloseDetils(${activeBand.id});" href=""><i class="fas fa-times"></i></a>
        </div>
        <div class="col-12 mt-3" >
            <div class="details_body d-flex flex-column">
            <div class="iframeContainer bg-loading">${activeBand.iframe}</div>
            <div class="text-center my-3"><a href="https://open.spotify.com/search/artists/${encodeURI(activeBand.name)}" target='_blank'>Find i spotify</a></div>
        </div>
        <div class="ratebar col-12 d-flex justify-content-around align-items-center px-0 py-4">
            <a href="" onclick="return setRating(this, ${activeBand.id},1);" class="${activeBand.rating == 1 ? `activeRating` : ``}""><i class="em-svg ${getIconName(1)}"></i></a>
            <a href="" onclick="return setRating(this, ${activeBand.id},2);" class="${activeBand.rating == 2 ? `activeRating` : ``}""><i class="em-svg ${getIconName(2)}"></i></a>
            <a href="" onclick="return setRating(this, ${activeBand.id},3);" class="${activeBand.rating == 3 ? `activeRating` : ``}""><i class="em-svg ${getIconName(3)}"></i></a>
            <a href="" onclick="return setRating(this, ${activeBand.id},4);" class="${activeBand.rating == 4 ? `activeRating` : ``}""><i class="em-svg ${getIconName(4)}"></i></a>
        </div>
        `
    }