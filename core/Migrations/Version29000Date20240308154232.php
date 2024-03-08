<?php

declare(strict_types=1);
/**
 * @copyright 2023 Benjamin Gaussorgues <benjamin.gaussorgues@nextcloud.com>
 *
 * @author Benjamin Gaussorgues <benjamin.gaussorgues@nextcloud.com>
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

namespace OC\Core\Migrations;

use Closure;
use OCP\DB\ISchemaWrapper;
use OCP\Migration\IOutput;
use OCP\Migration\SimpleMigrationStep;

/**
 * Remove duplicate indexes
 */
class Version29000Date20240308154232 extends SimpleMigrationStep {
	public function changeSchema(IOutput $output, Closure $schemaClosure, array $options): ?ISchemaWrapper {
		/** @var ISchemaWrapper $schema */
		$schema = $schemaClosure();

		// fs_parent is a left-prefix of fs_parent_name_hash
		$table = $schema->getTable('filecache');
		if ($table->hasIndex('fs_parent')) {
			$table->dropIndex('fs_parent');
		}

		// job_class_index is a left-prefix of job_argument_hash
		$table = $schema->getTable('jobs');
		if ($table->hasIndex('job_class_index')) {
			$table->dropIndex('job_class_index');
		}

		// mounts_storage_index is a left-prefix of mount_user_storage
		$table = $schema->getTable('mounts');
		if ($table->hasIndex('mounts_storage_index')) {
			$table->dropIndex('mounts_storage_index');
		}

		// comment_reaction_parent_id is a left-prefix of comment_reaction_unique
		$table = $schema->getTable('reactions');
		if ($table->hasIndex('comment_reaction_parent_id')) {
			$table->dropIndex('comment_reaction_parent_id');
		}

		// stocred_user is a left-prefix of stocred_ui
		$table = $schema->getTable('storages_credentials');
		if ($table->hasIndex('stocred_user')) {
			$table->dropIndex('stocred_user');
		}

		return $schema;
	}
}
