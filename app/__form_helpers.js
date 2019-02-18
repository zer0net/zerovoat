window.formHelpers = (function(){

  function validateTopicForm(state,config){
    let errors = [];
    if (!state.title){
      const error = {
        field:'title',
        msg:'title is required'
      }
      errors.push(error);
    }
    if (state.channel_id === "0" || !state.channel_id){
      const error = {
        field:'channel_id',
        msg:'channel is required'
      }
      errors.push(error);
    }
    if (state.embed_url && !state.embed_url.startsWith('merged-' + config.merger_name)){
      const error = {
        field:'embed_url',
        msg:'embed url must start with "merged-'+config.merger_name+'"'
      }
      errors.push(error);
    }
    return errors;
  }

  function validateChannelForm(state){
    let errors = [];
    if (!state.name){
      const error = {
        field:'name',
        msg:'name is required'
      }
      errors.push(error);
    }
    return errors;
  }

  function validateCommentForm(state){
    let errors = [];
    if (!state.text && !state.file){
      const error = {
        msg:"can't post empty comment!"
      }
      errors.push(error);
    }
    return errors;
  }

  function getEasyEditorOptions(){
    const options = {
      buttons: ['bold', 'italic', 'h2', 'h3', 'h4', 'alignleft', 'aligncenter', 'alignright', 'quote', 'code', 'x'],
      buttonsHtml: {
          'bold': '<i class="icon bold"></i>',
          'italic': '<i class="icon italic"></i>',
          'link': '<i class="icon link"></i>',
          'align-left': '<i class="icon align left"></i>',
          'align-center': '<i class="icon align center"></i>',
          'align-right': '<i class="icon align right"></i>',
          'quote': '<i class="icon quote left"></i>',
          'code': '<i class="icon code"></i>',
          'remove-formatting': '<i class="icon remove"></i>'
      },
      css: ({
          minHeight: '300px',
          maxHeight: '400px'
      }),
    }
    return options;
  }

  return {
    validateTopicForm,
    validateChannelForm,
    validateCommentForm,
    getEasyEditorOptions
  }

}());
