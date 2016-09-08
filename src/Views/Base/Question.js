applr.Views.Base.Question = Backbone.View.extend({
	tagName: 'li',

	modelAttributes: {},

	attributes: {
		class: 'question-line compact'
	},

	defaultTemplate: applr.Templates['Base.Question'],

	customFieldsTemplate: applr.Templates['Base.CustomCandFields'],

	render: function() {
		this.model.set('domID', Math.random().toString(36).slice(2));

		this.$el.html(this.defaultTemplate(this.model.toJSON()) + this.template(this.model.toJSON()));
		this.$el.find('.candidate-custom-fields').html(this.customFieldsTemplate(this.model.toJSON()));
		return this;
	},

	events: {
		'click .edit-question' : 'editQuestion',
		'click .save-candidate-filter' : 'saveFilter',
		'click .cancel-candidate-filter' : 'cancelFilter',
		'change input[name="ask"]' : 'changeAsk',
		'change [name="limit"]' : 'changeLimit',
		'change [name="required"]': 'changeRequired',
		'change [name="custom_field"]': 'changeCustomField',
		'click .remove-question' : 'destroyQuestion',
		'drop' : 'dropItem'
	},

	toggleEdit: function(e) {
		e.preventDefault();

		_editMode = !_editMode;
		_disableSortable();
		$(_options.wrapper).find('.hide-toggle').toggleClass('display-none');
		this.$el.find('.edit-mode').toggleClass('display-none');
		$(_options.wrapper).find('.question-line').toggleClass('compact');

        if (_editMode) {
            if (typeof _options.on_select_render == 'function') {
                _options.on_select_render(this.$el.find('select'));
            }
        }
	},

	editQuestion: function(e) {
		this.modelAttributes = _.clone(this.model.attributes);
		this.modelAttributes.options = _.clone(this.modelAttributes.options);

		if (typeof this.modelAttributes.answers != 'undefined') {
			var clonedAnserwsCollection = new applr.Collections.OptionalQuestions();
			this.modelAttributes.answers.each(function(model) {
				clonedAnserwsCollection.add(new applr.Models.CloseQuestionItem(model.toJSON()));
			});
			this.modelAttributes.answers = clonedAnserwsCollection;
		}

		this.toggleEdit(e);
	},

	changeAsk: function() {
		var value = this.$el.find('input[name="ask"]').val();
		this.model.set('ask', value);
		this.$el.find('.ask-val').html(this.model.get('ask'));
	},

	changeRequired: function() {
		var value = this.$el.find('input[name="required"]').is(':checked');
		var options = this.model.get('options');
		options.required = value;
		this.model.set('options', options, {validate : true});
	},

	changeCustomField: function() {
		var value = this.$el.find('[name="custom_field"]').val();
		var options = this.model.get('options');
		options.profile_field_id = value;
		this.model.set('options', options, {validate : true});
	},

	closeFilter: function(e) {
		$('#question-form-' + this.model.get('domID')).validationEngine('hide');

		this.toggleEdit(e);
		_DefaultQuestionCollectionView.render();
		_OptionalQuestionsCollectionView.render();
		_initSortable();
	},

	saveFilter: function(e) {
		e.preventDefault();

		var validationResult = $('#question-form-' + this.model.get('domID')).validationEngine('validate');

		if (validationResult) {
			this.closeFilter(e);
		}
	},

	cancelFilter: function(e) {
		e.preventDefault();

		this.model.attributes = this.modelAttributes;

		this.closeFilter(e);
	},

	changeLimit: function() {
		var value = this.$el.find('[name="limit"]').val();
		var options = this.model.get('options');
		options.limit = value;
		this.model.set('options', options, {validate : true});
	},

	destroyQuestion: function(e) {
		e.preventDefault();

		this.model.collection.remove(this.model);
		if (_options.add_type == 'new_fields') {
			_removedQuestionsCollection.add(this.model);
			_disableSortable();
			_OptionalQuestionsCollectionView.render();
			_DefaultQuestionCollectionView.render();
			_initSortable();
		} else if (_options.add_type == 'filter_questions') {
			_OptionalQuestionsCollection.add(this.model);
			this.removeQuestion(e);
		}
	},

	removeQuestion: function(event, index) {
		this.$el.remove();
	},

	dropItem: function(event, index) {
		if (_options.add_type == 'new_fields') {
			_DefaultQuestionCollection.remove(this.model);
			_OptionalQuestionsCollection.remove(this.model);
		}

		this.$el.trigger('update-sort', [this.model, index]);
	}
});