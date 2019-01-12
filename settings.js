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

function showSettings(){
    var settingsMenu = document.getElementById("settingsMenu");
    if(settingsMenu.innerHTML == ''){
        const settingsMenuHTML = `
            <div class="row mx-0 py-3 flex-column h-100">
                <h4 class="text-center mt-3 px-1 text-t">Vis</h4>   
                ${appSettings[1].filterRatings.map(function(filterRating, key){ return`
                <div class="d-flex justify-content-center align-items-center mb-3">
                    <a href="" onclick="return toggleFilterRating(this, ${key});" class="FilterToggle d-table p-1 ${filterRating == 1 ? `on`:`off`}" >
                        <i class="em-svg ${getIconName(key)}"></i>
                    </a>
                </div>
                `}).join('')}
                <div class="mt-auto text-center">
                    <a class='p-3' onclick="hideSettingsMenu();"><i class="fas fa-arrow-right fa-2x"></i></a>
                </div>
            </div>
        `;
        settingsMenu.innerHTML = settingsMenuHTML;
    
    } 
    
    settingsMenu.style.display = "block";
    var showSettingsMenu = settingsMenu.animate([
        {
            transform: `translateX(25vw)`
        },
        {
            transform: `translateX(0)`
        }
        ], {
        duration: 500,
        easing: 'cubic-bezier(0.165, 0.84, 0.44, 1)',
        fill: "forwards"
    });
    var shrinkContaioner = container.animate([
        {
            width: `100vw`
        },
        {
            width: `75vw`
        }
        ], {
        duration: 500,
        easing: 'cubic-bezier(0.165, 0.84, 0.44, 1)',
        fill: "forwards"
    });
    
    return false;

}

function hideSettingsMenu(){
    var settingsMenu = document.getElementById("settingsMenu");
    var container = document.getElementById("container");
    var hideSettingsMenu = settingsMenu.animate([
        {
            transform: `translateX(0)`
        },
        {
            transform: `translateX(25vw)`
        }
    ], {
        duration: 500,
        easing: 'cubic-bezier(0.165, 0.84, 0.44, 1)',
        fill: "forwards"
    });
    hideSettingsMenu.onfinish = function(){
        settingsMenu.style.display = "none";
    }
    var expandContaioner = container.animate([
        {
            width: `75vw`
        },
        {
            width: `100vw`
        }
        ], {
        duration: 500,
        easing: 'cubic-bezier(0.165, 0.84, 0.44, 1)',
        fill: "forwards"
    });
    return false;
}

function toggleFilterRating(_this, filterRatingId){
    var allbandsWithRating = document.querySelectorAll("[data-filterRatingId = '"+filterRatingId+"']");
    if(_this.classList.contains("off")){
        _this.classList.remove("off");
        _this.classList.add("on");
        showAllwithRating(allbandsWithRating);
        appSettings[1].filterRatings[filterRatingId] = 1;
    } else {
        _this.classList.remove("on");
        _this.classList.add("off");
        hideAllwithRating(allbandsWithRating);
        appSettings[1].filterRatings[filterRatingId] = 0;
    }
    localStorage.setItem('appSettings', JSON.stringify(appSettings));
    

    return false;
}

function showAllwithRating(allbandsWithRating){
    allbandsWithRating.forEach(function(e){
        e.style.display = "block";
        e.animate([
            {
                transform: `
                scale(0)
                `
            },
            {
                transform: `
                scale(1)
                `
            }
            ], {
            duration: 300,
            easing: 'cubic-bezier(0.175, 0.885, 0.32, 1.275',
            fill: "forwards"
        });
    });
}
function hideAllwithRating(allbandsWithRating){
    allbandsWithRating.forEach(function(e) {
        var hide = e.animate([
            {
                transform: `
                scale(1)
                `
            },
            {
                transform: `
                scale(0)
                `
            }
            ], {
            duration: 300,
            easing: 'cubic-bezier(0.6, -0.28, 0.735, 0.045)',
            fill: "forwards"
        });
        hide.onfinish = function(){
            e.style.display = "none";
        };
    });
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
        bands.sort(arraySort("name"));
        bands.sort(arraySort("HeadlineScore"));
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