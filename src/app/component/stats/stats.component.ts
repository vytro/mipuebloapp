import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { Stats } from 'src/app/interface/stats';

@Component({
  selector: 'app-stats',
  templateUrl: './stats.component.html',
  styleUrls: ['./stats.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StatsComponent {
  @Input() stats: Stats | undefined;
}
