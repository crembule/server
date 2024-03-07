<?php

declare(strict_types=1);

/**
 * @author Eduardo Morales emoral435@gmail.com>
 *
 * @license AGPL-3.0
 *
 * This code is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License, version 3,
 * as published by the Free Software Foundation.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License, version 3,
 * along with this program. If not, see <http://www.gnu.org/licenses/>
 *
 */
namespace OCA\Files_Versions\Listener;

use OC\Files\Node\Folder;
use OCP\EventDispatcher\Event;
use OCP\EventDispatcher\IEventListener;
use OCP\Files\Events\Node\NodeWrittenEvent;
use OCP\Files\Node;

class MetadataFileEvents implements IEventListener {

	public function __construct(

	){
	}

	public function handle(Event $event): void {
		if ($event instanceof NodeWrittenEvent) {
			$this->handleMetadata($event->getNode());
		}
	}

	public function handleMetadata(Node $node): void {
		// Do not handle folders
		if ($node instanceof Folder) {
			return;
		}
	}
}