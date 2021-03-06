//ACTION TYPES
const SELECT_CURRENT_CHARACTER = "CURRENT_CHARACTER";

//ACTION CREATORS
export function selectCurrentCharacter(character){
  return{
      type: SELECT_CURRENT_CHARACTER,
      selectedCharacter: character
  }
}

//REDUCER
const intitialState = "";

function selectedLetterReducer(state = intitialState, action){
    switch(action.type){
        case SELECT_CURRENT_CHARACTER:
            return state + action.selectedCharacter     
        default: 
            return state; 
    }
}

export default selectedLetterReducer;

