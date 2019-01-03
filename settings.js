var appSettings = [];
function getSettingsFromLS() {
    if( localStorage.getItem("appSettings") ){
        appSettings = JSON.parse(localStorage.getItem("appSettings"));
      } else {
        appSettings.push({eventSelected: 0}) 
        appSettings.push({filterRatings: [1,1,1,1,1]})
        appSettings.push({listSort: 0})
        localStorage.setItem('appSettings', JSON.stringify(appSettings));
      }
}


function openSettings(){
    const settingsMenuHTML = `
        <div class="row mx-0 p-3">
        <div class="col-12 d-flex align-items-center justify-content-center">
            <h4 class="pr-3">Sotér</h4>   
            <select id="sortSelector" class="custom-select">
                    <option value="0" ${appSettings[2].listSort == 0 ? `selected` : ``}>Hovedenavne</option>
                    <option value="1" ${appSettings[2].listSort == 1 ? `selected` : ``}>A-Å</option>
                    <option value="2" ${appSettings[2].listSort == 2 ? `selected` : ``}>Efter spilletidspunkt</option>
            </select>
        </div> 
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
    
    appSettings[2].listSort = document.getElementById("sortSelector").value;
    localStorage.setItem('appSettings', JSON.stringify(appSettings));
    SortBands();

    document.getElementById("settingsMenu").innerHTML = '';
    makeBandlistHTML();
}

function SortBands(){
    switch (appSettings[2].listSort) {
        case "0":
        bands.sort(arraySort("id"));
        break;
        case "1":
        bands.sort(arraySort("name"));
        break;
        case "0":
        // AND TIME
        bands.sort(arraySort("date"));
        break;
        
        default:
        break;
    }
}