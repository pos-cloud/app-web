import {
    Component,
    OnInit,
    EventEmitter,
    Output
} from '@angular/core';
import {
    PushNotificationsService
} from '../../services/push-notification.service';
@Component({
    moduleId: module.id,
    selector: 'push-notification',
    templateUrl: 'push-notification.component.html',
})
export class PushNotificationComponent implements OnInit {
    private title: string = 'Browser Push Notifications!';
    constructor(private _notificationService: PushNotificationsService) {
        this._notificationService.requestPermission();
    }
    ngOnInit() {}
    notify() {
        let data: Array < any >= [];
        data.push({
            'title': 'Approval',
            'alertContent': 'This is First Alert -- By Debasis Saha'
        });
        data.push({
            'title': 'Request',
            'alertContent': 'This is Second Alert -- By Debasis Saha'
        });
        data.push({
            'title': 'Leave Application',
            'alertContent': 'This is Third Alert -- By Debasis Saha'
        });
        data.push({
            'title': 'Approval',
            'alertContent': 'This is Fourth Alert -- By Debasis Saha'
        });
        data.push({
            'title': 'To Do Task',
            'alertContent': 'This is Fifth Alert -- By Debasis Saha'
        });
        this._notificationService.generateNotification(data);
    }
}