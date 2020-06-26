import { Component, OnInit } from '@angular/core';

import interact from 'interactjs';

@Component({
  selector: 'app-canvas',
  templateUrl: './canvas.component.html',
  styleUrls: ['./canvas.component.css']
})
export class CanvasComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {

    this.initDraggableComponents();

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
    });
  }

  createDDComponent(identifer: string): void {

  }
}
