var appSettings = [];
function getSettingsFromLS() {
    if( localStorage.getItem("appSettings") ){
        appSettings = JSON.parse(localStorage.getItem("appSettings"));
      } else {
        appSettings.push({eventSelected: "0"});
        appSettings.push({filterRatings: [1,1,1,1,1]});
        appSettings.push({listSort: "0"});
        localStorage.setItem('appSettings', JSON.stringify(appSettings));
      }
}
    
function makeSortmenu(){
    const sortMenuHtml = `
    <a href="" onclick="return toggleSort(this,'0');">
        <i class="fas fa-star mx-3 ${appSettings[2].listSort != "0" ? `text-bg` : ``}"></i>
    </a>
    <a href="" onclick="return toggleSort(this,'1');">
        <i class="fas fa-sort-alpha-down mx-3 ${appSettings[2].listSort != "1" ? `text-bg` : ``}"></i>
    </a>
    <a href="" onclick="return toggleSort(this,'2');">
        <i class="fas fa-clock mx-3 ${appSettings[2].listSort != "2" ? `text-bg` : ``}"></i>
    </a>
    <a href="" onclick="return toggleSort(this,'3');">
        <i class="fas fa-smile mx-3 ${appSettings[2].listSort != "3" ? `text-bg` : ``}"></i>
    </a>  
    `;
    document.getElementById("sortmenu").innerHTML = sortMenuHtml;
}

function openSettings(){
    const settingsMenuHTML = `
        <div class="row mx-0 p-3">
        <h4 class="col-12 text-center mt-3">Vis:</h4>   
        ${appSettings[1].filterRatings.map(function(filterRating, key){ return`
            <div class="col-12 p-3 d-flex justify-content-center">
                <a href="" onclick="return toggleFilterRating(this, ${key});" class="FilterToggle d-table p-1 ${filterRating == 1 ? `on`:`off`}" >
                    <i class="em-svg ${getIconName(key)}"></i>
                </a>
            </div>
            `}).join('')}
        </div>
        <div class="col-12 text-center">
            <button class="btn btn-susses" onclick="SubmitSettings();">Færdig</button>
        </div>
    `;
    document.getElementById("settingsMenu").innerHTML = settingsMenuHTML;
    return false;
}

function toggleFilterRating(_this, filterRatingId){
    if(_this.classList.contains("off")){
        _this.classList.remove("off");
        _this.classList.add("on");
        appSettings[1].filterRatings[filterRatingId] = 1;
    } else {
        _this.classList.remove("on");
        _this.classList.add("off");
        appSettings[1].filterRatings[filterRatingId] = 0;
    }
    localStorage.setItem('appSettings', JSON.stringify(appSettings));
    return false;
}

function SubmitSettings(){
    document.getElementById("bandlist").innerHTML = "henter bands...";
    document.getElementById("settingsMenu").innerHTML = '';
    makeBandlistHTML();
}

function toggleSort(_this, sortValue){
    _this.querySelector("svg").classList.remove("text-bg");
    for (let sibling of _this.parentNode.children) {
        if (sibling !== _this) sibling.querySelector("svg").classList.add('text-bg');
    }
    appSettings[2].listSort = sortValue;
    localStorage.setItem('appSettings', JSON.stringify(appSettings));
    document.getElementById("bandlist").innerHTML = "henter bands...";
    SortBands();
    makeBandlistHTML();
    return false;
}

function SortBands(){

    switch (appSettings[2].listSort) {
        case "0":
        bands.sort(arraySort("id"));
        break;
        case "1":
        bands.sort(arraySort("name"));
        break;
        case "2":
        // AND TIME
        bands.sort(arraySort("date"));
        break;
        case "3":
        // AND TIME
        bands.sort(arraySort("-rating"));
        break;
        
        default:
        break;
    }
}