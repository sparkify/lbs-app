import {Component, OnInit, ViewEncapsulation} from '@angular/core';

import interact from 'interactjs';
import * as d3 from 'd3';


@Component({
  selector: 'app-canvas',
  templateUrl: './canvas.component.html',
  styleUrls: ['./canvas.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class CanvasComponent implements OnInit {

  svg: any;
  zoomGroup: any;
  zoom: any = d3.zoom();

  xScale = d3.scaleLinear();
  yScale = d3.scaleLinear();
  xAxis;
  yAxis;

  constructor() { }

  ngOnInit(): void {

    this.initSVG();

    this.initDropZone();
    this.initDraggableComponents();

    // const _self = this;
    // this.svg
    //     .on('mousemove', function() {
    //       const coords = d3.mouse(d3.event.currentTarget); // svg coordinates for the mouse
    //       // console.log(_self.getSVGCoordinates(coords));
    //       // console.log(window.event.pageX, window.event.pageY);
    //     });

    // let bbRect = this.svg.node().getBoundingClientRect();
    // let offsetX = bbRect.x;
    // let offsetY = bbRect.y;
    //
    // console.log(this.svg.node().getBoundingClientRect());
    // console.log(this.getSVGCoordinates([0, 0]));

  }

  private getSVGCoordinates(coords: any): any {
    const zoomTransform = d3.zoomTransform(this.svg.node());
    const svgCoords = zoomTransform.invert(coords);
    return {x: Math.round(svgCoords[0]), y: Math.round(svgCoords[1])};
  }

  private updateAxis(width, height): void {
    this.xScale.domain([-1, width + 1])
        .range([-1, width + 1]);
    this.yScale.domain([-1, height + 1])
        .range([-1, height + 1]);
    this.xAxis = d3.axisBottom(this.xScale);
    this.yAxis = d3.axisRight(this.yScale);
  }

  private initSVG(): void {
    this.svg = d3.select('.vis-container');
    this.zoomGroup = this.svg.append('g');
    let svgBB;

    // initial start
    svgBB = this.svg.node().getBoundingClientRect();
    this.updateAxis(svgBB.width, svgBB.height);

    this.xAxis.ticks((svgBB.width + 2) / (svgBB.height + 2) * 10)
        .tickSize(svgBB.height)
        .tickPadding(8 - svgBB.height);
    this.yAxis.ticks(10)
        .tickSize(svgBB.width)
        .tickPadding(8 - svgBB.width);

    const gX = this.svg.append('g')
        .attr('class', 'axis axis--x')
        .call(this.xAxis);
    const gY = this.svg.append('g')
        .attr('class', 'axis axis--y')
        .call(this.yAxis);

    this.zoom.scaleExtent([0.1, 1])
    // .translateExtent([[-100, -100], [width + 90, height + 100]])
        .on('zoom', () => {
          this.zoomGroup.attr('transform', d3.event.transform);
          gX.call(this.xAxis.scale(d3.event.transform.rescaleX(this.xScale)));
          gY.call(this.yAxis.scale(d3.event.transform.rescaleY(this.yScale)));
        });

    this.svg.call(this.zoom);

    window.onresize = () => {
      svgBB = this.svg.node().getBoundingClientRect();
      this.updateAxis(svgBB.width, svgBB.height);
      gX.call(this.xAxis);
      gY.call(this.yAxis);
    };
  }

  private initDropZone(): void {
    interact('.vis-container').dropzone({
      // only accept elements matching this CSS selector
      accept: '.droppable',
      // Require a 75% element overlap for a drop to be possible
      overlap: 0.75,

      // listen for drop related events:

      ondropactivate: (event) => {
        // add active dropzone feedback
        event.target.classList.add('drop-active');
      },
      ondragenter: (event) => {
        const draggableElement = event.relatedTarget;
        const dropzoneElement = event.target;

        // feedback the possibility of a drop
        dropzoneElement.classList.add('drop-target');
        draggableElement.classList.add('can-drop');
        draggableElement.textContent = 'Dragged in';
      },
      ondragleave: (event) => {
        // remove the drop feedback style
        event.target.classList.remove('drop-target');
        event.relatedTarget.classList.remove('can-drop');
        event.relatedTarget.textContent = 'Dragged out';
      },
      ondrop: (event) => { // only called when dropped within area.

        const buttonID = event.relatedTarget.attributes.id.nodeValue;
        event.relatedTarget.textContent = `Dropped ${buttonID}`;


        // get bounding box of the svg
        const bbRect = this.svg.node().getBoundingClientRect();
        const offsetX = bbRect.x;
        const offsetY = bbRect.y;
        // get global mouse position
        const pXY = (window.event) as MouseEvent;

        this.createSVGElement('.vis-container', buttonID, this.getSVGCoordinates([pXY.pageX - offsetX, pXY.pageY - offsetY]));

      },
      ondropdeactivate: (event) => {
        // remove active dropzone feedback
        event.target.classList.remove('drop-active');
        event.target.classList.remove('drop-target');
      }
    });
  }

  private createSVGElement(parent: string, id: string, coords: any): void {
    this.zoomGroup.append('rect')
        .attr('x', coords.x)
        .attr('y', coords.y)
        .attr('width', 200)
        .attr('height', 200)
        .style('fill', 'red')
        .call(d3.drag()
            .on('start', function() {
              d3.select(<any> this).raise();
            })
            .on('drag', function() {
              // console.log(d3.event.x);
              d3.select(this).attr('x', +d3.select(this).attr('x') + d3.event.dx).attr('y', +d3.select(this).attr('y') + d3.event.dy);
            })
            .on('end', function() {
              // ignore
            }));
  }

  private initDraggableComponents(): void {
    const position = { x: 0, y: 0 };
    interact('.button')
      .draggable({
        manualStart: true,
        listeners: {
          move(event) {
            position.x += event.dx;
            position.y += event.dy;
            event.target.style.transform = `translate(${position.x}px, ${position.y}px)`;
          }
        }
      })
      .on('move', (event) => {
        const { currentTarget, interaction } = event;
        let element = currentTarget;

        // If we are dragging an item from the sidebar, its transform value will be ''
        // We need to clone it, and then start moving the clone
        if (interaction.pointerIsDown && !interaction.interacting() && currentTarget.style.transform === '') {
          element = currentTarget.cloneNode(true);

          // Add absolute positioning so that cloned object lives
          // right on top of the original object
          element.style.position = 'absolute';
          element.style.left = 0;
          element.style.top = 0;

          // Add the cloned object to the document
          const container = document.querySelector('.wrapper');
          container.appendChild(element);

          // TODO create svg element in SVG .vis-container

          const { offsetTop, offsetLeft } = currentTarget;
          position.x = offsetLeft;
          position.y = offsetTop;

          // If we are moving an already existing item, we need to make sure
          // the position object has the correct values before we start dragging it
        } else if (interaction.pointerIsDown && !interaction.interacting()) {
          const regex = /translate\(([\d]+)px, ([\d]+)px\)/i;
          const transform = regex.exec(currentTarget.style.transform);

          if (transform && transform.length > 1) {
            position.x = Number(transform[1]);
            position.y = Number(transform[2]);
          }
        }

        // Start the drag event
        interaction.start({ name: 'drag' }, event.interactable, element);
    }).on('dragend', (event) => {
      event.target.parentNode.removeChild(event.target);
    });
  }

  createDDComponent(identifer: string): void {

  }
}
