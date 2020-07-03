import { Component, OnInit } from '@angular/core';

import interact from 'interactjs';
import * as d3 from 'd3';


@Component({
  selector: 'app-canvas',
  templateUrl: './canvas.component.html',
  styleUrls: ['./canvas.component.css']
})
export class CanvasComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {


    this.initDropZone();
    this.initDraggableComponents();

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

        this.createSVGElement('.vis-container', buttonID);

      },
      ondropdeactivate: (event) => {
        // remove active dropzone feedback
        event.target.classList.remove('drop-active');
        event.target.classList.remove('drop-target');
      }
    });
  }

  private createSVGElement(parent: string, id: string): void {
    d3.select(parent).append('rect')
        .attr('x', 100)
        .attr('y', 100)
        .attr('width', 200)
        .attr('height', 200)
        .style('fill', 'red');
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
