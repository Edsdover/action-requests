import { fallbackImageUrl, hostedUrl, requestsUrl } from './shared';
import { titlecase } from './util';

export function generateHtml(actionRequest) {
  let attachmentUrl;
  let thumbUrl;

  if (actionRequest.attachments && actionRequest.attachments.length) {
    attachmentUrl = actionRequest.attachments[0].attachmentUrl;
    thumbUrl = actionRequest.attachments[0].thumbUrl;

    if (attachmentUrl !== thumbUrl) {
      thumbUrl = `${hostedUrl}/${thumbUrl}`;
    }
  } else {
    attachmentUrl = requestsUrl + '/' + actionRequest.key;
    thumbUrl = fallbackImageUrl;
  }

  // tslint:disable max-line-length
  return `<div>
  <div>
    <h3>Action Request</h3>
    <p>
      ${ actionRequest.humanReadableCode || 'Unknown ID' }
      <br>
      <span style="color: #aaa;">${ actionRequest.updatedAt && new Date(actionRequest.updatedAt).toLocaleString('en-US', { timeZone: 'America/Los_Angeles' }) || '' }</span>
      <br><br>
      <a href="${requestsUrl}/${actionRequest.key}" target="_blank" style="text-decoration:none;cursor:pointer;">
        <button style="cursor:pointer;position:relative;padding:0;overflow:hidden;border-width:0;outline:0;border-radius:2px;box-shadow:0 1px 4px rgba(0,0,0,.6);background-color:#009688;color:#ecf0f1;transition:background-color .3s" type="button">
          <span style="cursor:pointer;display: block;position: relative;padding: 12px 24px;">
            OPEN
          </span>
        </button>
      </a>
    </p>

    <h3>Reporter</h3>
    <p>
      ${ actionRequest.reporter || 'No reporter provided.' }
    </p>

    <h3>Assignee</h3>
    <p>
      ${ actionRequest.assignee || 'No assignee.' }
    </p>

    <h3>Sales Order</h3>
    <p>
      SO# ${ actionRequest.salesOrderNumber && actionRequest.salesOrderNumber.toUpperCase() || 'Unknown' }
    </p>

    <h3>Category</h3>
    <p>
      ${ titlecase(actionRequest.category) }
    </p>

    <h3>Discrepancy</h3>
    <p>
      ${ actionRequest.discrepancy || 'No discrepancy information provided.' }
    </p>

    <h3>Suggested Remedy</h3>
    <p>
      ${ actionRequest.suggestedRemedy || 'No suggested remedy provided.' }
    </p>

    <h3>Attachments</h3>
    <div>
      <span>
        <a target="_blank" href="${ attachmentUrl }">
          <img src="${ thumbUrl }" style="height: 120px;width: 120px;margin-left: 10px;margin-right: 10px;object-fit: cover;">
        </a>
      </span>
    </div>

    <h3>Status</h3>
    <p>
      ${ titlecase(actionRequest.status) || 'No status available.' }
    </p>

    <h3>Approved Plan of Action</h3>
    <p>
      ${ actionRequest.approvedActionPlan || 'No action plan available.' }
    </p>

    <h3>ECN</h3>
    <p>
      ${ actionRequest.ecn || 'No ECN provided.' }
    </p>

    <h3>${ actionRequest.resolution && 'Resolution' || '' }</h3>
    <p>
      ${ actionRequest.resolution || '' }
    </p>
  </div>
  <div>
    <a href="${requestsUrl}/${actionRequest.key}" target="_blank" style="text-decoration:none;cursor:pointer;">
      <button style="cursor:pointer;position:relative;padding:0;overflow:hidden;border-width:0;outline:0;border-radius:2px;box-shadow:0 1px 4px rgba(0,0,0,.6);background-color:#009688;color:#ecf0f1;transition:background-color .3s" type="button">
        <span style="cursor:pointer;display: block;position: relative;padding: 12px 24px;">
          VIEW
        </span>
      </button>
    </a>
  </div>
  </div>`;
}
