import { Component, Input } from "@angular/core";

@Component({
  selector: 'custom-media',
  templateUrl: './media.component.html',
  styleUrls: ['./media.component.css'],
})
export class MediaComponent {
  @Input()
  headerTitle!: string;

  @Input()
  altHeaderTitle!: string;

  @Input()
  headerSubTitle!: string;

  @Input()
  glyphicon!: string;
}
