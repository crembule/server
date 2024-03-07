<?php

declare(strict_types=1);

/**
 * @copyright Copyright (c) 2024 Eduardo Morales <emoral435@gmail.com>
 *
 * @license GNU AGPL version 3 or any later version
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 *
 */
namespace OCA\Files_Versions\Versions;

use OCP\Files\File;
use OCP\IUserSession;

/**
 * This interface edits the metadata column of a node.
 * Each column of the metadata has a key => value mapping.
 * @since 29.0.0
 */
interface IStoreMetadataBackend {
	/**
	 * For now, stores the version owner in the metadata column.
	 *
	 * @param File $file the file that triggered the Metadata event listener
	 * @param IUserSession $user the user that will now have their data stored for this version
	 * @since 29.0.0
	 */
	public function setMetadata(File $file, IUserSession $userSession): void;
}