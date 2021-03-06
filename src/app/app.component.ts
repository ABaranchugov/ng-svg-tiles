import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { DataTools } from './data-tools.service';
import { FormControl, FormGroup } from '@angular/forms';
import { NgbTabset } from '@ng-bootstrap/ng-bootstrap';
import { saveAs } from 'file-saver';

@Component({
	selector: 'app-root',
	templateUrl: './app.component.html',
	styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
	constructor( public dataTools: DataTools ) {}
	public ngOnInit() {
		
	}
	
	tileHeight = 300;
	tileWidth = 300;
	dimensionsForm = new FormGroup({
		tileHeight: new FormControl(this.tileHeight),
		tileWidth: new FormControl(this.tileWidth),
	});
	showTileBorders = false;
	changedTemplate = '';
	
	@ViewChild(NgbTabset, {static: false})
	private tabset: NgbTabset;

	@ViewChild('renderedView', {static: false})
	renderedView: ElementRef;

	public onDimensionsSubmit() {
		this.tileHeight = parseFloat(this.dimensionsForm.value.tileHeight);
		this.tileWidth = parseFloat(this.dimensionsForm.value.tileWidth);
	}
	public infoEditRequest(templateText: string) {
		this.template = templateText;
		this.tileWidth = 300;
		this.tileHeight = 300;
		this.dimensionsForm.controls.tileHeight.setValue(300);
		this.dimensionsForm.controls.tileWidth.setValue(300);
		this.tabset.select('home');
	}
	public saveSvg() {
		const svgElementClone = this.renderedView
				.nativeElement
				.querySelector('div.tiles-row')
				.children[0]
				.cloneNode(true),
			commentRemovalQueue = [svgElementClone],
			svgHolder = document.createElement('div');
		for (let el of commentRemovalQueue) {
			const commentChildren = [];
			for (let childNode of el.childNodes) {
				if (childNode.nodeType === 8) {
					commentChildren.push(childNode);
				} else {
					commentRemovalQueue.push(childNode);
				}
			}
			commentChildren.forEach(commentNode => el.removeChild(commentNode));
		}
		svgHolder.appendChild(svgElementClone);
		const svgText = svgHolder.innerHTML;
		saveAs(new Blob([svgText], {type:'image/svg+xml;charset=utf-8'}), 'tile.svg');
	}
	public composeSVGTemplate(): string {
		const tileBordersSVG = this.showTileBorders ? `
				<path d="M ${this.tileWidth-1} 0 L ${this.tileWidth-1} ${this.tileHeight-1}"
					  stroke="black"
					  stroke-dasharray="5,5"
					  stroke-width="1"
					  stroke-opacity="0.5"></path>
				<path d="M 0 ${this.tileHeight-1} L ${this.tileWidth-1} ${this.tileHeight-1}"
					  stroke="black"
					  stroke-dasharray="5,5"
					  stroke-width="1"
					  stroke-opacity="0.5"></path>
				<path d="M ${this.tileWidth-1} 5 L ${this.tileWidth-1} ${this.tileHeight-1}"
					  stroke="white"
					  stroke-dasharray="5,5"
					  stroke-width="1"
					  stroke-opacity="0.9"></path>
				<path d="M 5 ${this.tileHeight-1} L ${this.tileWidth-1} ${this.tileHeight-1}"
					  stroke="white"
					  stroke-dasharray="5,5"
					  stroke-width="1"
					  stroke-opacity="0.9"></path>
		` : '';
		return (`<div class="tiles-row" style="width:${this.tileWidth * 3}px">`+ 
			`<svg width="${this.tileWidth}" height="${this.tileHeight}">
				${this.template}
				${tileBordersSVG}
			 </svg>`.repeat(3) 
			+ '</div>')
			.repeat(3);
	}
    public template = `<g *ngFor = "let row of tools.generateGrid({
        rowsCount: 2,
        columnsCount: 17,
        xSpacing: 20,
        ySpacing: 300
    })">
    <path *ngFor = "let tile of row"
          stroke = "#00ffff"
          fill = "none"
          stroke-width = 13
          stroke-opacity=0.5
		  [attr.d]="tile.startPath(0, -10)
						.curveWithAngle(180, 301, 200, 120, 200, 120)
						.toString()"></path>
</g>
 <g *ngFor = "let row of tools.generateGrid({
        rowsCount: 17,
        columnsCount: 2,
        xSpacing: 300,
        ySpacing: 20
    })">
    <path *ngFor = "let tile of row"
          stroke = "#ffff00"
          fill = "none"
          stroke-width = 13
          stroke-opacity=0.5
		  [attr.d]="tile.startPath(-10, 0)
						.curveWithAngle(90, 301, 70, 120, 70, 120)
						.toString()"></path>
</g>`;
}
