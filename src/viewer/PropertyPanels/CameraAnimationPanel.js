
import {Utils} from "../../utils.js";
import {CameraMode} from "../../defines";

export class CameraAnimationPanel{
	constructor(viewer, propertiesPanel, animation){
		this.viewer = viewer;
		this.propertiesPanel = propertiesPanel;
		this.animation = animation;

		this.elContent = $(`
			<div class="propertypanel_content">
				<span id="animation_keyframes"></span>

				<span>

					<span style="display:flex">
						<span style="display:flex; align-items: center; padding-right: 10px">Duration: </span>
						<input name="spnDuration" value="5.0" style="flex-grow: 1; width:100%">
					</span>
					
					<span>
						<selectgroup id="animation_type_options" name="animationType">
							<option id="animation_type_continuous" value="CONTINUOUS">Continuous</option>
							<option id="animation_type_steps" value="STEPS">Steps</option>
						</selectgroup>
					</span>
					
					<span>
						<selectgroup id="animation_loop_options" name="animationLoop">
							<option id="animation_loop_on" value="on">ON</option>
							<option id="animation_loop_off" value="off">OFF</option>
						</selectgroup>
					</span>
					
					<span>Time: </span><span id="lblTime"></span> <div id="sldTime"></div>

					<input name="play" type="button" value="play"/>
					<input name="stop" type="button" value="stop"/>
				</span>
			</div>
		`);

		const elPlay = this.elContent.find("input[name=play]");
		elPlay.click( () => {
			animation.play();
		});

		const elStop = this.elContent.find("input[name=stop]");
		elStop.click( () => {
			animation.stop();
		});

		const elSlider = this.elContent.find('#sldTime');
		elSlider.slider({
			value: 0,
			min: 0,
			max: 1,
			step: 0.001,
			slide: (event, ui) => {
				animation.set(ui.value);
			}
		});

		const elAnimationType = this.elContent.find(`selectgroup[name=animationType]`);
		elAnimationType.selectgroup({title: "Animation type"});
		elAnimationType.mousedown( (e) => {
			animation.setAnimationType(e.target.innerText.toLowerCase());
		});

		const elAnimationLoop = this.elContent.find(`selectgroup[name=animationLoop]`);
		elAnimationLoop.selectgroup({title: "Looping animation"});
		elAnimationLoop.mousedown( (e) => {
			let loop = false;
			if (e.target.innerText.toLowerCase() === 'on')
				loop = true
			animation.setAnimationLoop(loop);
		});


		let elDuration = this.elContent.find(`input[name=spnDuration]`);
		elDuration.spinner({
			min: 0, max: 300, step: 0.01,
			numberFormat: 'n',
			start: () => {},
			spin: (event, ui) => {
				let value = elDuration.spinner('value');
				animation.setDuration(value);
			},
			change: (event, ui) => {
				let value = elDuration.spinner('value');
				animation.setDuration(value);
			},
			stop: (event, ui) => {
				let value = elDuration.spinner('value');
				animation.setDuration(value);
			},
			incremental: (count) => {
				let value = elDuration.spinner('value');
				let step = elDuration.spinner('option', 'step');

				let delta = value * 0.05;
				let increments = Math.max(1, parseInt(delta / step));

				return increments;
			}
		});
		elDuration.spinner('value', animation.getDuration());
		elDuration.spinner('widget').css('width', '100%');

		const elKeyframes = this.elContent.find("#animation_keyframes");

		const updateKeyframes = () => {
			elKeyframes.empty();

			//let index = 0;

			// <span style="flex-grow: 0;">
			// 				<img name="add" src="${Potree.resourcePath}/icons/add.svg" style="width: 1.5em; height: 1.5em"/>
			// 			</span>

			const addNewKeyframeItem = (index) => {
				let elNewKeyframe = $(`
					<div style="display: flex; margin: 0.2em 0em">
						<span style="flex-grow: 1"></span>
						<input type="button" name="add" value="insert control point" />
						<span style="flex-grow: 1"></span>
					</div>
				`);

				const elAdd = elNewKeyframe.find("input[name=add]");
				elAdd.click( () => {
					animation.createControlPoint(index);
				});

				elKeyframes.append(elNewKeyframe);
			};

			const addKeyframeItem = (index) => {
				let elKeyframe = $(`
					<div style="display: flex; margin: 0.2em 0em">
						<span style="flex-grow: 0;">
							<img name="assign" src="${Potree.resourcePath}/icons/assign.svg" style="width: 1.5em; height: 1.5em"/>
						</span>
						<span style="flex-grow: 0;">
							<img name="move" src="${Potree.resourcePath}/icons/circled_dot.svg" style="width: 1.5em; height: 1.5em"/>
						</span>
						<span style="flex-grow: 0; width: 1.5em; height: 1.5em"></span>
						<span style="flex-grow: 0; font-size: 1.5em">keyframe</span>
						<span style="flex-grow: 1"></span>
						<span style="flex-grow: 0;">
							<img name="delete" src="${Potree.resourcePath}/icons/remove.svg" style="width: 1.5em; height: 1.5em"/>
						</span>
					</div>
				`);

				const elAssign = elKeyframe.find("img[name=assign]");
				const elMove = elKeyframe.find("img[name=move]");
				const elDelete = elKeyframe.find("img[name=delete]");

				elAssign.click( () => {
					const cp = animation.controlPoints[index];

					cp.position.copy(viewer.scene.view.position);
					cp.target.copy(viewer.scene.view.getPivot());
				});

				elMove.click( () => {
					const cp = animation.controlPoints[index];

					viewer.scene.view.position.copy(cp.position);
					viewer.scene.view.lookAt(cp.target);
				});

				elDelete.click( () => {
					const cp = animation.controlPoints[index];
					animation.removeControlPoint(cp);
				});

				elKeyframes.append(elKeyframe);
			};

			let index = 0;

			addNewKeyframeItem(index);

			for(const cp of animation.controlPoints){

				addKeyframeItem(index);
				index++;
				addNewKeyframeItem(index);

			}
		};

		updateKeyframes();

		animation.addEventListener("controlpoint_added", updateKeyframes);
		animation.addEventListener("controlpoint_removed", updateKeyframes);




		// this._update = () => { this.update(); };

		// this.update();
	}

	update(){

	}
};
