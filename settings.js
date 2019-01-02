var appSettings = [];
function getSettingsFromLS() {
    if( localStorage.getItem("appSettings") ){
        appSettings = JSON.parse(localStorage.getItem("appSettings"));
      } else {
        appSettings.push({eventSelected: 0}) 
        appSettings.push({filterRatings: [1,1,1,1,1]})
        localStorage.setItem('appSettings', JSON.stringify(appSettings));
      }
}


function openSettings(){
    const settingsMenuHTML = `
        <div class="row mx-0 p-3">
        <div class="col-12 d-flex align-items-center justify-content-center">
            <h4 class="pr-3">Sotér</h4>   
            <select id="sortSelector" class="custom-select">
                    <option value="0" selected>Hovedenavne</option>
                    <option value="1">A-Å</option>
                    <option value="2">Efter Dag</option>
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
            <button onclick="SubmitSettings();">Færdig</button>
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
    document.getElementById("settingsMenu").innerHTML = '';
    document.getElementById("bandlist").innerHTML = "henter bands...";

    // check hvad sortSelector er
    bands.sort(arraySort("name"));

    
    makeBandlistHTML();
}