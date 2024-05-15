import { Component, Input } from "@angular/core";

@Component({
  selector: "custom-card",
  templateUrl: "./card.component.html",
  styleUrls: ["./card.component.css"],
})
export class CardComponent {
  @Input()
  headerTitle!: string;

  @Input()
  headerSubTitle!: string;

  @Input()
  glyphicon!: string;
}
