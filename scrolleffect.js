var isHeaderGone = false;
var headerHeight;
var selectorwrapper;
var selectorwrapperHeight;
var selectorwrapperOffset;
var headerTramsisionEnd;
window.addEventListener("load",function(){
    var eventSelected = parseInt( appSettings[0].eventSelected );
    this.document.getElementById('eventSelectedName').innerHTML = events[eventSelected].eventName;

    headerHeight = document.getElementById("header").offsetHeight;
    selectorwrapper = document.getElementById("headerSelector")
    selectorwrapperHeight = selectorwrapper.offsetHeight;
    selectorwrapperOffset = selectorwrapper.offsetTop;
    headerTramsisionEnd = ((selectorwrapperHeight-headerHeight)/2)+selectorwrapperOffset;

    var isScrolling;
    var isScrollingStopped = true;
    var isTouchStopped = true;

    document.getElementById("container").addEventListener("scroll", function(e){
        var scaleFactor = 1 - this.scrollTop/headerTramsisionEnd;
        if(scaleFactor >= 0 ){
            selectorwrapper.style.transform = "scale("+scaleFactor+")";
            selectorwrapper.style.opacity = scaleFactor;
        }
        if(this.scrollTop > headerTramsisionEnd && !isHeaderGone){
            selectorwrapper.style.opacity = 0;
            showHeadline();
            isHeaderGone = true;
        }
        if(this.scrollTop < headerTramsisionEnd && isHeaderGone){
            hideHeadline();
            isHeaderGone = false;
        }
        // make isScrolling
        	// Clear our timeout throughout the scroll
            window.clearTimeout( isScrolling );
            isScrollingStopped = false;
            // Set a timeout to run after scrolling ends
            isScrolling = setTimeout(function() {
                if(isTouchStopped){
                    positionScroll(document.getElementById("container"));
                }
                // Run the callback
                isScrollingStopped = true;
            }, 66);
    });

    document.getElementById("container").addEventListener("touchmove", function(e){
        isTouchStopped = false;
    });

    document.getElementById("container").addEventListener("touchend", function(e){       
        if(isScrollingStopped){
            positionScroll(document.getElementById("container"));
        }
        isTouchStopped = true;
    });

    function positionScroll(_this){
        var scroll = _this.scrollTop;
        if(scroll > 0 && scroll <= headerHeight ){
            _this.scroll({top: 0, left: 0, behavior: 'smooth' });
        }
        else if (scroll > headerHeight && scroll < (selectorwrapperHeight + selectorwrapperOffset - headerHeight)){
            _this.scroll({top: (selectorwrapperHeight + selectorwrapperOffset - headerHeight) + 16, left: 0, behavior: 'smooth' });
        }
    }

},false);

function showHeadline(){
    var headerHeadline = document.getElementById("headerHeadline");
    headerHeadline.style.display = 'block';
    var show = headerHeadline.animate([
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
        duration: 200,
        easing: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
        fill: "forwards"
      });
      var bgColor = getComputedStyle(document.body).getPropertyValue('--bg');
      document.getElementById("header").style.background = bgColor;
}
function hideHeadline(){
    var headerHeadline = document.getElementById("headerHeadline");
    var hide = headerHeadline.animate([
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
        duration: 200,
        fill: "forwards"
    });
    hide.onfinish = function(){
        headerHeadline.style.display = 'none';
        document.getElementById("header").style.background = "none"
    };
}