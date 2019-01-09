function getStage(stageID){
    const RoskildeFestivalStages = ['Orange','Arana','Pavilion','Pavilion Jr.','Apollo','Countdown','Avalon'];
    const CopenhellStages = ['Helvíti','Hades','Pandæmonium'];
    switch (appSettings[0].eventSelected) {
        case "0":
            return RoskildeFestivalStages[stageID];
            break;
        case "1":
            return CopenhellStages[stageID];
            break;
        default:
            break;
    }
}
function getColor(rate){
    switch (rate) {
        case 0:
            return "bg-t text-t";
            break;
        case 1:
            return "bg-s-darker text-s-darker";
            break;
        case 2:
            return "bg-s-dark text-s-dark";
            break;
        case 3:
            return "bg-s text-s";
            break;
        case 4:
            return "bg-p text-p";
            break;
        default:
            break;
    }
}
function getIconName(rate){
    switch (rate) {
        case 0:
            return "em-white_circle";
            break;
        case 1:
            return "em-face_vomiting";
            break;
        case 2:
            return "em-no_mouth";
            break;
        case 3:
            return "em-slightly_smiling_face";
            break;
        case 4:
            return "em-heart_eyes";
            break;
        default:
            break;
    }
}