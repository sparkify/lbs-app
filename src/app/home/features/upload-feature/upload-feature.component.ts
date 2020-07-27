import {Component, Input, OnInit} from '@angular/core';

@Component({
  selector: 'app-upload-feature',
  templateUrl: './upload-feature.component.html',
  styleUrls: ['./upload-feature.component.css']
})
export class UploadFeatureComponent implements OnInit {

  @Input() id: string;

  constructor() { }

  ngOnInit(): void {
  }

}
